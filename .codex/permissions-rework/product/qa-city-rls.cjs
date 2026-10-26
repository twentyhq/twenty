const assert = require('node:assert/strict');
const { readFileSync, writeFileSync } = require('node:fs');
const { setTimeout: delay } = require('node:timers/promises');
const { api, login } = require('./local-api.cjs');

const directory = __dirname;
const fixtures = JSON.parse(
  readFileSync(`${directory}/city-rls-fixtures.json`),
);
const expectedRecords = JSON.parse(
  readFileSync(`${directory}/city-rls-expected-records.json`),
);
const report = { startedAt: new Date().toISOString(), checks: [], phases: [] };
const save = () =>
  writeFileSync(
    `${directory}/qa-city-rls-results.json`,
    JSON.stringify(report, null, 2),
  );
const sorted = (identifiers) => [...identifiers].sort();

(async () => {
  const member = await login();
  const administrator = await login('jane.austen@apple.dev');
  const core = (query, variables, token = member) =>
    api(query, variables, token, 'graphql');
  const memberCity = (city) =>
    core(
      'mutation($id:UUID!,$data:WorkspaceMemberUpdateInput!){updateWorkspaceMember(id:$id,data:$data){id city}}',
      { id: fixtures.memberId, data: { city } },
      administrator,
    );
  const companyCity = (city) =>
    core(
      'mutation($id:UUID!,$data:CompanyUpdateInput!){updateCompany(id:$id,data:$data){id}}',
      {
        id: fixtures.companies.newYork.id,
        data: { address: { addressCity: city } },
      },
      administrator,
    );
  const newYorkTarget = fixtures.taskTargets.find(
    (target) => target.taskId === fixtures.tasks.newYork.id,
  );
  const taskCompany = (companyId) =>
    core(
      'mutation($id:UUID!,$data:TaskTargetUpdateInput!){updateTaskTarget(id:$id,data:$data){id}}',
      { id: newYorkTarget.id, data: { targetCompanyId: companyId } },
      administrator,
    );
  const point = async (objectName, id, allowed) => {
    try {
      const result = await core(
        `query($id:UUID!){${objectName}(filter:{id:{eq:$id}}){id}}`,
        { id },
      );
      if (allowed)
        assert.equal(
          result[objectName]?.id,
          id,
          `${objectName} ${id} should be readable`,
        );
      else
        assert.equal(
          result[objectName],
          null,
          `${objectName} ${id} should be hidden`,
        );
    } catch (error) {
      if (
        allowed ||
        !/NOT_FOUND|FORBIDDEN|not found|permission/i.test(error.message)
      )
        throw error;
    }
  };
  const collection = async (objectName, pageSize = 200) => {
    const records = [];
    let after;
    let totalCount;
    do {
      const data = (
        await core(
          `query($after:String,$first:Int!){${objectName}(first:$first,after:$after){totalCount pageInfo{hasNextPage endCursor} edges{node{id ${objectName === 'companies' ? 'address{addressCity}' : ''}}}}}`,
          { after, first: pageSize },
        )
      )[objectName];
      totalCount = data.totalCount;
      records.push(...data.edges.map(({ node }) => node));
      after = data.pageInfo.hasNextPage ? data.pageInfo.endCursor : null;
      if (records.length > 10000) throw Error('Unexpected unbounded result');
    } while (after);
    assert.equal(
      new Set(records.map(({ id }) => id)).size,
      records.length,
      'Pagination duplicated a record',
    );
    assert.equal(
      totalCount,
      records.length,
      'Exact count differs from paginated results',
    );
    return records;
  };
  const converge = async (label, expected, city) => {
    const started = Date.now();
    let actual;
    for (let attempt = 0; attempt < 180; attempt++) {
      const companies = await collection('companies');
      const tasks = await collection('tasks');
      actual = {
        companyIds: sorted(companies.map(({ id }) => id)),
        taskIds: sorted(tasks.map(({ id }) => id)),
      };
      if (
        JSON.stringify(actual.companyIds) ===
          JSON.stringify(sorted(expected.companyIds)) &&
        JSON.stringify(actual.taskIds) ===
          JSON.stringify(sorted(expected.taskIds))
      ) {
        if (city)
          assert.ok(
            companies.every((company) => company.address.addressCity === city),
          );
        const phase = {
          label,
          companies: companies.length,
          tasks: tasks.length,
          convergenceMilliseconds: Date.now() - started,
        };
        report.phases.push(phase);
        save();
        console.log(JSON.stringify(phase));
        return;
      }
      await delay(1000);
    }
    assert.deepEqual(
      actual,
      {
        companyIds: sorted(expected.companyIds),
        taskIds: sorted(expected.taskIds),
      },
      label,
    );
  };
  const verifyFixturePoints = async (city) => {
    for (const company of Object.values(fixtures.companies)) {
      await point(
        'company',
        company.id,
        Boolean(city) && company.city === city,
      );
    }
    for (const task of Object.values(fixtures.tasks)) {
      await point(
        'task',
        task.id,
        Boolean(city) &&
          task.companyKeys.some((key) => fixtures.companies[key].city === city),
      );
    }
  };

  let companyChanged = false;
  let taskChanged = false;
  try {
    for (let attempt = 0; attempt < 180; attempt++) {
      const state = (await api('{recordPermissionPolicy}', {}, member))
        .recordPermissionPolicy;
      if (state.activeRevisionId === fixtures.revisionId) break;
      if (state.status === 'failed') throw Error(state.failureReason);
      if (attempt === 179) throw Error('City policy did not activate');
      await delay(1000);
    }
    report.revisionId = fixtures.revisionId;
    for (const city of [
      'San Francisco',
      'New York',
      null,
      '',
      'San Francisco',
    ]) {
      console.log(JSON.stringify({ checkingCity: city }));
      await memberCity(city);
      await verifyFixturePoints(city);
      report.checks.push(
        `Live company and inherited task reads follow member city ${JSON.stringify(city)} immediately`,
      );
      const expected = expectedRecords.find((entry) => entry.city === city) ?? {
        companyIds: [],
        taskIds: [],
      };
      await converge(`Member city ${JSON.stringify(city)}`, expected, city);
    }

    const sanFrancisco = expectedRecords.find(
      (entry) => entry.city === 'San Francisco',
    );
    assert.deepEqual(
      sorted((await collection('companies', 7)).map(({ id }) => id)),
      sorted(sanFrancisco.companyIds),
    );
    assert.deepEqual(
      sorted((await collection('tasks', 7)).map(({ id }) => id)),
      sorted(sanFrancisco.taskIds),
    );
    report.checks.push(
      'Unfiltered seven-row cursor pagination and exact counts match SQL-derived company and task sets',
    );

    const response = await fetch(
      `http://localhost:3000/rest/companies/${fixtures.companies.newYork.id}`,
      {
        headers: {
          Authorization: `Bearer ${member}`,
          Origin: 'http://localhost:3001',
        },
      },
    );
    assert.equal(response.status, 404);
    report.checks.push('REST denies an out-of-city company');

    await companyCity('San Francisco');
    companyChanged = true;
    await point('company', fixtures.companies.newYork.id, true);
    await point('task', fixtures.tasks.newYork.id, true);
    await converge(
      'Company moves into member city',
      {
        companyIds: [...sanFrancisco.companyIds, fixtures.companies.newYork.id],
        taskIds: [...sanFrancisco.taskIds, fixtures.tasks.newYork.id],
      },
      'San Francisco',
    );
    await companyCity('New York');
    companyChanged = false;
    await point('company', fixtures.companies.newYork.id, false);
    await point('task', fixtures.tasks.newYork.id, false);
    await converge(
      'Company moves out of member city',
      sanFrancisco,
      'San Francisco',
    );
    report.checks.push(
      'Company city edits update direct and inherited access, then projections converge',
    );

    await taskCompany(fixtures.companies.sanFrancisco.id);
    taskChanged = true;
    await point('task', fixtures.tasks.newYork.id, true);
    await converge(
      'Task relinked into member city',
      {
        companyIds: sanFrancisco.companyIds,
        taskIds: [...sanFrancisco.taskIds, fixtures.tasks.newYork.id],
      },
      'San Francisco',
    );
    await taskCompany(fixtures.companies.newYork.id);
    taskChanged = false;
    await point('task', fixtures.tasks.newYork.id, false);
    await converge(
      'Task relinked out of member city',
      sanFrancisco,
      'San Francisco',
    );
    report.checks.push('Relation edits grant and revoke inherited task access');
    report.checks.push(
      'South San Francisco, missing-city companies, and unlinked tasks stay hidden; a task linked to both cities is visible once',
    );
    report.finishedAt = new Date().toISOString();
  } finally {
    if (taskChanged) await taskCompany(fixtures.companies.newYork.id);
    if (companyChanged) await companyCity('New York');
    await memberCity('San Francisco');
    save();
  }
  console.log(
    JSON.stringify({
      passed: report.checks.length,
      phases: report.phases.length,
    }),
  );
})().catch((error) => {
  report.error = error.message;
  save();
  console.error(error);
  process.exitCode = 1;
});
