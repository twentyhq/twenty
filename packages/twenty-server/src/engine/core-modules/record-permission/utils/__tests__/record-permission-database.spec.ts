import { readRecordPermissionScanBatch } from 'src/engine/core-modules/record-permission/utils/read-record-permission-scan-batch.util';
import { compileRecordPermissionExplanation } from 'src/engine/core-modules/record-permission/utils/compile-record-permission-explanation.util';
import { type RecordPermissionScan } from 'src/engine/core-modules/record-permission/types/record-permission-scan.type';
import { compileInheritedRecordShares } from 'src/engine/core-modules/record-permission/utils/compile-inherited-record-shares.util';
import { enrollRecordPermissionMetadata } from 'src/engine/core-modules/record-permission/utils/enroll-record-permission-metadata.util';
import { type DataSource } from 'typeorm';
import { RecordPermissionWorkerService } from 'src/engine/core-modules/record-permission/services/record-permission-worker.service';
import { type RecordPermissionPolicyService } from 'src/engine/core-modules/record-permission/services/record-permission-policy.service';
import { Client } from 'pg';
import { RECORD_PERMISSION_ACTIONS } from 'twenty-shared/constants';
import {
  RowLevelPermissionPredicateOperand,
  type RecordPermissionAction,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { compileRecordPermission } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { installRecordPermissionStorage } from 'src/engine/core-modules/record-permission/utils/install-record-permission-storage.util';
import { recomputeRecordPermissionBatch } from 'src/engine/core-modules/record-permission/utils/recompute-record-permission-batch.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

const connectionString = process.env.RECORD_PERMISSION_TEST_DATABASE_URL;
const describeDatabase = connectionString ? describe : describe.skip;

describeDatabase('Record permission SQL and durable invalidation', () => {
  jest.useRealTimers();
  const fixture = createRecordPermissionTestContext();
  const { context, objects, rule } = fixture;
  const schema = `"${context.schemaName}"`;
  const client = new Client({ connectionString });
  const database: RecordPermissionDatabase = {
    query: async (sql, parameters) =>
      (await client.query(sql, parameters)).rows,
  };
  const companyId = v4();
  const personId = v4();
  const messageId = v4();
  const participantId = v4();
  const shareId = v4();
  let groups: ReturnType<typeof resolveRecordPermissionAccessGroups>;

  const admitted = async (
    objectName: string,
    action: RecordPermissionAction,
    strategy: 'live' | 'projected' = 'live',
  ) => {
    const condition = compileRecordPermission({
      context,
      action,
      objectUniversalIdentifier: objects[objectName].universalIdentifier,
      tableAlias: 'record',
      strategy,
    });
    const statement = compileNamedParameters(
      `SELECT record.id FROM ${schema}."${objectName}" record WHERE (${condition.sql}) ORDER BY record.id`,
      condition.parameters,
    );
    return (await client.query(statement)).rows.map(
      (record: { id: string }) => record.id,
    );
  };
  const recompute = (objectName: string, recordIds: string[]) =>
    recomputeRecordPermissionBatch({
      database,
      context,
      groups,
      objectUniversalIdentifier: objects[objectName].universalIdentifier,
      recordIds,
    });

  beforeAll(async () => {
    await client.connect();
    const [{ current_database: databaseName }] = (
      await client.query('SELECT current_database()')
    ).rows;
    if (!String(databaseName).endsWith('_permission_test'))
      throw new Error('Use an isolated database ending in _permission_test');
    await client.query(
      `CREATE SCHEMA IF NOT EXISTS core; CREATE TABLE IF NOT EXISTS core."recordPermissionRevision" (id uuid PRIMARY KEY, status text NOT NULL); CREATE SCHEMA ${schema}`,
    );
    await client.query(
      'INSERT INTO core."recordPermissionRevision" VALUES ($1, $2)',
      [context.revisionId, 'active'],
    );
    for (const object of Object.values(objects)) {
      await client.query(
        `CREATE TABLE ${schema}."${object.nameSingular}" (id uuid PRIMARY KEY, "deletedAt" timestamptz, city text, "companyId" uuid, "personId" uuid, "messageId" uuid, "objectMetadataId" uuid, "recordId" uuid, "principalId" uuid, "accessLevel" text)`,
      );
    }
    await installRecordPermissionStorage({
      database,
      schemaName: context.schemaName,
      metadata: context,
    });
    await client.query(
      `UPDATE ${schema}."recordPermissionState" SET "activeRevisionId" = $1`,
      [context.revisionId],
    );
    await client.query(
      `INSERT INTO ${schema}.company (id, city) VALUES ($1, 'Paris')`,
      [companyId],
    );
    await client.query(
      `INSERT INTO ${schema}.person (id, "companyId") VALUES ($1, $2)`,
      [personId, companyId],
    );
    await client.query(`INSERT INTO ${schema}.message (id) VALUES ($1)`, [
      messageId,
    ]);
    await client.query(
      `INSERT INTO ${schema}."messageParticipant" (id, "personId", "messageId") VALUES ($1, $2, $3)`,
      [participantId, personId, messageId],
    );
  }, 30_000);

  afterAll(async () => {
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await client.query(
      'DELETE FROM core."recordPermissionRevision" WHERE id = $1',
      [context.revisionId],
    );
    await client.end();
  });

  it('restarts physical progress after a table rewrite and visits every primary key', async () => {
    await client.query(
      `CREATE TABLE ${schema}.scan_probe AS SELECT md5(value::text)::uuid AS id, repeat('x', 750) AS payload FROM generate_series(1, 1000) value`,
    );
    await client.query(`ANALYZE ${schema}.scan_probe`);
    let scan: RecordPermissionScan = {
      blockCursor: 0,
      blockLimit: null,
      relationFileNode: null,
    };
    const readBatch = async () => {
      await client.query('BEGIN');
      try {
        const batch = await readRecordPermissionScanBatch({
          database,
          schemaName: context.schemaName,
          tableName: 'scan_probe',
          scan,
          batchSize: 100,
        });
        await client.query('COMMIT');
        return batch;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    };
    scan = await readBatch();
    expect(scan.blockCursor).toBeGreaterThan(0);
    const previousFileNode = scan.relationFileNode;
    await client.query(`VACUUM FULL ${schema}.scan_probe`);
    const identifiers = new Set<string>();
    for (let attempt = 0; attempt < 100; attempt++) {
      const batch = await readBatch();
      if (attempt === 0) {
        expect(batch.relationFileNode).not.toBe(previousFileNode);
        expect(batch.blockCursor).toBe(scan.blockCursor);
      }
      batch.recordIds.forEach((id) => identifiers.add(id));
      scan = batch;
      if (batch.complete) break;
    }
    expect(identifiers.size).toBe(1000);
    expect(scan.blockCursor).toBe(scan.blockLimit);
  });

  it('matches live and materialized inherited grants for all six actions', async () => {
    groups = resolveRecordPermissionAccessGroups({
      revisionId: context.revisionId,
      definition: context.definition,
      authority: context.authorities[0],
      metadata: context,
    });
    for (const group of groups)
      await client.query(
        `INSERT INTO ${schema}."recordPermissionAccessGroup" VALUES ($1, $2, $3)`,
        [group.id, context.revisionId, group],
      );
    expect(await recompute('company', [companyId])).toBe(1);
    expect(await recompute('message', [messageId])).toBe(1);
    for (const action of RECORD_PERMISSION_ACTIONS) {
      expect(await admitted('message', action, 'projected')).toEqual(
        await admitted('message', action),
      );
    }
    expect(await admitted('message', 'read')).toEqual([messageId]);
    expect(await admitted('message', 'destroy')).toEqual([]);
  });

  it('explains the matching three-field rule without exposing ancestor records or values', async () => {
    const { statement, sources } = compileRecordPermissionExplanation({
      context,
      action: 'read',
      objectUniversalIdentifier: objects.message.universalIdentifier,
      recordId: messageId,
    });
    const [result] = (
      await client.query(
        compileNamedParameters(statement.sql, statement.parameters),
      )
    ).rows;
    expect(result.allowed).toBe(true);
    const matched = sources.filter((source) =>
      result.sourceIds.includes(source.id),
    );
    expect(matched).toHaveLength(1);
    expect(matched[0]).toMatchObject({
      kind: 'rule',
      ruleUniversalIdentifier: rule.universalIdentifier,
      fieldUniversalIdentifiers: [
        fixture.people.universalIdentifier,
        fixture.participants.universalIdentifier,
        fixture.message.universalIdentifier,
      ],
    });
    expect(JSON.stringify(matched)).not.toContain(companyId);
    expect(JSON.stringify(matched)).not.toContain('Paris');
  });

  it('skips unchanged projections without generating business invalidations', async () => {
    await client.query(`DELETE FROM ${schema}."recordPermissionWork"`);
    expect(await recompute('message', [messageId])).toBe(0);
    expect(
      (
        await client.query(
          `SELECT count(*)::int AS count FROM ${schema}."recordPermissionWork"`,
        )
      ).rows[0].count,
    ).toBe(0);
  });

  it('captures old and new relation endpoints in the source transaction', async () => {
    await client.query('BEGIN');
    await client.query(
      `UPDATE ${schema}."messageParticipant" SET "messageId" = $1 WHERE id = $2`,
      [v4(), participantId],
    );
    const [work] = (
      await client.query(
        `SELECT snapshots FROM ${schema}."recordPermissionWork" WHERE "recordId" = $1`,
        [participantId],
      )
    ).rows;
    expect(
      work.snapshots.map(
        (snapshot: { messageId: string }) => snapshot.messageId,
      ),
    ).toContain(messageId);
    expect(work.snapshots).toHaveLength(2);
    expect(work.snapshots[0].readableByAccessGroupIds).toBeUndefined();
    await client.query('ROLLBACK');
    expect(
      (
        await client.query(
          `SELECT count(*)::int AS count FROM ${schema}."recordPermissionWork"`,
        )
      ).rows[0].count,
    ).toBe(0);
  });

  it('denies a fresh point read after a source change while the collection catches up', async () => {
    await client.query(
      `UPDATE ${schema}.company SET city = 'London' WHERE id = $1`,
      [companyId],
    );
    expect(await admitted('message', 'read')).toEqual([]);
    expect(await admitted('message', 'read', 'projected')).toEqual([messageId]);
    expect(await recompute('message', [messageId])).toBe(1);
    expect(await admitted('message', 'read', 'projected')).toEqual([]);
  });

  it('combines source shares with Receive and inherits every granted action', async () => {
    rule.actions = ['receive'];
    rule.condition = null;
    groups = resolveRecordPermissionAccessGroups({
      revisionId: context.revisionId,
      definition: context.definition,
      authority: context.authorities[0],
      metadata: context,
    });
    for (const group of groups)
      await client.query(
        `INSERT INTO ${schema}."recordPermissionAccessGroup" VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [group.id, context.revisionId, group],
      );
    await client.query(
      `INSERT INTO ${schema}."recordShare" (id, "objectMetadataId", "recordId", "principalId", "accessLevel") VALUES ($1, $2, $3, $4, 'FULL')`,
      [shareId, objects.company.id, companyId, context.authorities[0].roleId],
    );
    for (const action of RECORD_PERMISSION_ACTIONS)
      expect(await admitted('message', action)).toEqual([messageId]);
    await recompute('message', [messageId]);
    await client.query(`DELETE FROM ${schema}."recordShare" WHERE id = $1`, [
      shareId,
    ]);
    expect(await admitted('message', 'read')).toEqual([]);
    expect(await admitted('message', 'read', 'projected')).toEqual([messageId]);
    await recompute('message', [messageId]);
    expect(await admitted('message', 'read', 'projected')).toEqual([]);
  });

  it('pages inherited source grants across three fields without storing descendant shares', async () => {
    const identifiers = [v4(), v4()].sort();
    for (const identifier of identifiers)
      await client.query(
        `INSERT INTO ${schema}."recordShare" (id, "objectMetadataId", "recordId", "principalId", "accessLevel") VALUES ($1, $2, $3, $4, 'READ')`,
        [identifier, objects.company.id, companyId, v4()],
      );
    try {
      const query = compileInheritedRecordShares({
        context,
        targetObjectUniversalIdentifier: objects.message.universalIdentifier,
        recordId: messageId,
        after: identifiers[0],
      })!;
      const rows = (
        await client.query(compileNamedParameters(query.sql, query.parameters))
      ).rows;
      expect(rows.map((row) => row.id)).toEqual([identifiers[1]]);
      expect(rows[0].fieldUniversalIdentifiers).toEqual([
        fixture.people.universalIdentifier,
        fixture.participants.universalIdentifier,
        fixture.message.universalIdentifier,
      ]);
      expect(
        (
          await client.query(
            `SELECT count(*)::int AS count FROM ${schema}."recordShare" WHERE "objectMetadataId" = $1`,
            [objects.message.id],
          )
        ).rows[0].count,
      ).toBe(0);
    } finally {
      await client.query(
        `DELETE FROM ${schema}."recordShare" WHERE id = ANY($1::uuid[])`,
        [identifiers],
      );
    }
  });

  it('projects a thousand recipients together and removes a revoked source grant', async () => {
    rule.actions = ['receive'];
    rule.condition = null;
    const recipients = Array.from({ length: 1000 }, () => ({
      principalId: v4(),
      groupId: v4(),
      shareId: v4(),
    }));
    const base = resolveRecordPermissionAccessGroups({
      revisionId: context.revisionId,
      definition: context.definition,
      authority: context.authorities[0],
      metadata: context,
    })[0];
    groups = recipients.map(({ principalId, groupId }) => ({
      ...base,
      id: groupId,
      sharePrincipalIds: [principalId],
    }));
    await client.query(
      `INSERT INTO ${schema}."recordShare" (id, "objectMetadataId", "recordId", "principalId", "accessLevel") SELECT "shareId", $1::uuid, $2::uuid, "principalId", 'READ' FROM jsonb_to_recordset($3::jsonb) AS shares("shareId" uuid, "principalId" uuid)`,
      [objects.company.id, companyId, JSON.stringify(recipients)],
    );
    try {
      await recompute('message', [messageId]);
      const [row] = (
        await client.query(
          `SELECT "readableByAccessGroupIds", "writableByAccessGroupIds" FROM ${schema}.message WHERE id = $1`,
          [messageId],
        )
      ).rows;
      expect(row.readableByAccessGroupIds).toEqual(
        recipients.map((recipient) => recipient.groupId).sort(),
      );
      expect(row.writableByAccessGroupIds).toEqual([]);
      await client.query(`DELETE FROM ${schema}."recordShare" WHERE id = $1`, [
        recipients[0].shareId,
      ]);
      await recompute('message', [messageId]);
      expect(
        (
          await client.query(
            `SELECT "readableByAccessGroupIds" FROM ${schema}.message WHERE id = $1`,
            [messageId],
          )
        ).rows[0].readableByAccessGroupIds,
      ).not.toContain(recipients[0].groupId);
    } finally {
      await client.query(
        `DELETE FROM ${schema}."recordShare" WHERE id = ANY($1::uuid[])`,
        [recipients.map((recipient) => recipient.shareId)],
      );
    }
  });

  it('uses inherited Receive to admit a child share and propagates it through the remaining fields', async () => {
    const personPolicy = context.definition.objects.find(
      (object) =>
        object.objectUniversalIdentifier === objects.person.universalIdentifier,
    )!;
    const messagePolicy = context.definition.objects.find(
      (object) =>
        object.objectUniversalIdentifier ===
        objects.message.universalIdentifier,
    )!;
    const originalPaths = messagePolicy.inheritancePaths;
    const previousCondition = rule.condition;
    personPolicy.inheritancePaths = [
      {
        universalIdentifier: v4(),
        sourceObjectUniversalIdentifier: objects.company.universalIdentifier,
        fieldUniversalIdentifiers: [fixture.people.universalIdentifier],
      },
    ];
    messagePolicy.inheritancePaths = [
      {
        universalIdentifier: v4(),
        sourceObjectUniversalIdentifier: objects.person.universalIdentifier,
        fieldUniversalIdentifiers: [
          fixture.participants.universalIdentifier,
          fixture.message.universalIdentifier,
        ],
      },
    ];
    rule.condition = {
      kind: 'predicate',
      fieldUniversalIdentifier: fixture.city.universalIdentifier,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: 'London',
    };
    groups = resolveRecordPermissionAccessGroups({
      revisionId: context.revisionId,
      definition: context.definition,
      authority: context.authorities[0],
      metadata: context,
    });
    await client.query(
      `INSERT INTO ${schema}."recordShare" (id, "objectMetadataId", "recordId", "principalId", "accessLevel") VALUES ($1, $2, $3, $4, 'READ')`,
      [shareId, objects.person.id, personId, context.authorities[0].roleId],
    );
    try {
      expect(await admitted('person', 'read')).toEqual([personId]);
      expect(await admitted('message', 'read')).toEqual([messageId]);
      const explanation = compileRecordPermissionExplanation({
        context,
        action: 'read',
        objectUniversalIdentifier: objects.person.universalIdentifier,
        recordId: personId,
      });
      const [explained] = (
        await client.query(
          compileNamedParameters(
            explanation.statement.sql,
            explanation.statement.parameters,
          ),
        )
      ).rows;
      expect(explained.allowed).toBe(true);
      expect(
        explanation.sources.filter((source) =>
          explained.sourceIds.includes(source.id),
        ),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'share',
            fieldUniversalIdentifiers: [],
          }),
        ]),
      );
      await recompute('person', [personId]);
      await recompute('message', [messageId]);
      expect(await admitted('message', 'read', 'projected')).toEqual([
        messageId,
      ]);
      context.capabilitiesByObjectUniversalIdentifier[
        objects.person.universalIdentifier
      ] = { receive: false };
      expect(await admitted('person', 'read')).toEqual([]);
      expect(await admitted('message', 'read')).toEqual([]);
      expect(await admitted('message', 'read', 'projected')).toEqual([]);
      await recompute('message', [messageId]);
      expect(await admitted('message', 'read', 'projected')).toEqual([]);
    } finally {
      delete context.capabilitiesByObjectUniversalIdentifier[
        objects.person.universalIdentifier
      ];
      personPolicy.inheritancePaths = [];
      messagePolicy.inheritancePaths = originalPaths;
      rule.condition = previousCondition;
      await client.query(`DELETE FROM ${schema}."recordShare" WHERE id = $1`, [
        shareId,
      ]);
    }
  });

  it('keeps conditional group identities separate when roles have different unconditional actions', async () => {
    const secondRole = { roleId: v4(), roleUniversalIdentifier: v4() };
    const definition = structuredClone(context.definition);
    const companyPolicy = definition.objects.find(
      (object) =>
        object.objectUniversalIdentifier ===
        objects.company.universalIdentifier,
    )!;
    const firstConditional = {
      ...rule,
      universalIdentifier: v4(),
      actions: ['read', 'update'] as RecordPermissionAction[],
      condition: {
        kind: 'predicate' as const,
        fieldUniversalIdentifier: fixture.city.universalIdentifier,
        operand: RowLevelPermissionPredicateOperand.CONTAINS,
        value: 'Paris',
      },
    };
    const secondConditional = {
      ...firstConditional,
      universalIdentifier: v4(),
      roleUniversalIdentifier: secondRole.roleUniversalIdentifier,
      condition: { ...firstConditional.condition, value: 'London' },
    };
    companyPolicy.rules = [
      firstConditional,
      {
        ...firstConditional,
        universalIdentifier: v4(),
        actions: ['read'],
        condition: null,
      },
      secondConditional,
      {
        ...secondConditional,
        universalIdentifier: v4(),
        actions: ['update'],
        condition: null,
      },
    ];
    const localContext = { ...context, definition };
    const localGroups = [context.authorities[0], secondRole].flatMap(
      (authority) =>
        resolveRecordPermissionAccessGroups({
          revisionId: context.revisionId,
          definition,
          metadata: context,
          authority,
        }),
    );
    await recomputeRecordPermissionBatch({
      database,
      context: localContext,
      groups: localGroups,
      objectUniversalIdentifier: objects.company.universalIdentifier,
      recordIds: [companyId],
    });
    const [record] = (
      await client.query(
        `SELECT "readableByAccessGroupIds", "writableByAccessGroupIds" FROM ${schema}.company WHERE id = $1`,
        [companyId],
      )
    ).rows;
    expect(record.readableByAccessGroupIds).toEqual([
      localGroups.find(
        (group) =>
          group.rule?.universalIdentifier ===
          secondConditional.universalIdentifier,
      )!.id,
    ]);
    expect(record.writableByAccessGroupIds).toEqual([]);
  });

  it('does not union independent application and user authority', async () => {
    rule.actions = ['read'];
    context.authorities.push({ roleId: v4(), roleUniversalIdentifier: v4() });
    expect(await admitted('company', 'read')).toEqual([]);
    context.authorities.pop();
    expect(await admitted('company', 'read')).toEqual([companyId]);
  });
  it('publishes only after a concurrent business transaction and its inherited changes are caught up', async () => {
    const candidateId = v4();
    const candidateDefinition = structuredClone(context.definition);
    const candidateRule = candidateDefinition.objects.find(
      (object) =>
        object.objectUniversalIdentifier ===
        objects.company.universalIdentifier,
    )!.rules[0];
    candidateRule.condition = {
      kind: 'predicate',
      fieldUniversalIdentifier: fixture.city.universalIdentifier,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: 'Berlin',
    };
    const revisions = [
      {
        id: context.revisionId,
        status: 'active',
        workspaceId: objects.company.workspaceId,
        definition: context.definition,
      },
      {
        id: candidateId,
        status: 'building',
        workspaceId: objects.company.workspaceId,
        definition: candidateDefinition,
      },
    ];
    const repository = {
      find: async () =>
        revisions.filter((revision) =>
          ['active', 'building'].includes(revision.status),
        ),
      update: async (
        { id }: { id: string },
        { status }: { status: string },
      ) => {
        revisions.find((revision) => revision.id === id)!.status = status;
        await client.query(
          'UPDATE core."recordPermissionRevision" SET status = $2 WHERE id = $1',
          [id, status],
        );
      },
    };
    const manager = { query: database.query, getRepository: () => repository };
    const dataSource = {
      ...manager,
      createQueryRunner: () => ({
        query: database.query,
        connect: async () => undefined,
        release: async () => undefined,
        startTransaction: async () => client.query('BEGIN'),
        commitTransaction: async () => client.query('COMMIT'),
        rollbackTransaction: async () => client.query('ROLLBACK'),
        isTransactionActive: true,
      }),
      transaction: async (
        work: (transaction: typeof manager) => Promise<unknown>,
      ) => {
        await client.query('BEGIN');
        try {
          const result = await work(manager);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      },
    } as unknown as DataSource;
    const policy = {
      loadContext: async (
        _workspaceId: string,
        revision: (typeof revisions)[number],
      ) => ({
        ...context,
        revisionId: revision.id,
        definition: revision.definition,
      }),
      buildAccessGroups: async (
        _workspaceId: string,
        workerContext: typeof context,
      ) =>
        resolveRecordPermissionAccessGroups({
          revisionId: workerContext.revisionId,
          definition: workerContext.definition,
          authority: workerContext.authorities[0],
          metadata: workerContext,
        }),
    } as unknown as RecordPermissionPolicyService;
    const worker = new RecordPermissionWorkerService(dataSource, policy);
    const writer = new Client({ connectionString });
    await writer.connect();
    await client.query(
      'INSERT INTO core."recordPermissionRevision" VALUES ($1, $2)',
      [candidateId, 'building'],
    );
    await client.query(
      `UPDATE ${schema}."recordPermissionState" SET "candidateRevisionId" = $1`,
      [candidateId],
    );
    for (const object of context.definition.objects) {
      const objectId =
        context.flatObjectMetadataMaps.byUniversalIdentifier[
          object.objectUniversalIdentifier
        ]!.id;
      await client.query(
        `INSERT INTO ${schema}."recordPermissionScan" ("revisionId", "objectMetadataId") VALUES ($1, $2)`,
        [candidateId, objectId],
      );
    }
    await enrollRecordPermissionMetadata({
      dataSource,
      workspaceId: objects.company.workspaceId,
      schemaName: context.schemaName,
      metadata: context,
    });
    try {
      await writer.query('BEGIN');
      await writer.query(
        'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
        [context.schemaName + ':record-permissions'],
      );
      await worker.drain(objects.company.workspaceId);
      expect(
        (
          await client.query(
            `SELECT "candidateRevisionId" FROM ${schema}."recordPermissionState"`,
          )
        ).rows[0].candidateRevisionId,
      ).toBe(candidateId);
      await writer.query(
        `UPDATE ${schema}.company SET city = 'Berlin' WHERE id = $1`,
        [companyId],
      );
      await writer.query('COMMIT');
      await worker.drain(objects.company.workspaceId);
      const [state] = (
        await client.query(
          `SELECT "candidateRevisionId", "activeRevisionId" FROM ${schema}."recordPermissionState"`,
        )
      ).rows;
      expect(state).toEqual({
        candidateRevisionId: null,
        activeRevisionId: candidateId,
      });
      const candidateContext = {
        ...context,
        revisionId: candidateId,
        definition: candidateDefinition,
      };
      const condition = compileRecordPermission({
        context: candidateContext,
        action: 'read',
        objectUniversalIdentifier: objects.message.universalIdentifier,
        tableAlias: 'record',
        strategy: 'projected',
      });
      const statement = compileNamedParameters(
        `SELECT id FROM ${schema}.message record WHERE ${condition.sql}`,
        condition.parameters,
      );
      expect((await client.query(statement)).rows).toEqual([{ id: messageId }]);
      expect(await admitted('message', 'read')).toEqual([]);
    } finally {
      await writer.query('ROLLBACK');
      await writer.end();
      await client.query(
        'DELETE FROM core."recordPermissionRevision" WHERE id = $1',
        [candidateId],
      );
    }
  }, 15_000);
});
