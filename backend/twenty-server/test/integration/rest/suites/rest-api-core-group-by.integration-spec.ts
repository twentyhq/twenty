import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

const OPPORTUNITY_GQL_FIELDS = `
  id
  stage
  amount {
    amountMicros
  }
  companyId
  createdAt
  closeDate
`;

// used not to mix records with the seeded ones
const FILTER_2020 =
  "createdAt[gte]:'2020-01-01T00:00:00.000Z',createdAt[lte]:'2020-03-03T23:59:59.999Z'";

const AGGREGATE_FIELDS = '["maxAmountAmountMicros"]';

describe('REST API Core Group By endpoint', () => {
  const testOpportunityId1 = randomUUID();
  const testOpportunityId2 = randomUUID();
  const testOpportunityId3 = randomUUID();
  const testOpportunityId4 = randomUUID();
  const testCompanyId1 = randomUUID();
  const testCompanyId2 = randomUUID();
  const COMPANY_1_EMPLOYEES = 10;
  const COMPANY_2_EMPLOYEES = 20;

  beforeAll(async () => {
    //   Create test companies
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId1,
          name: 'Company 1',
          employees: COMPANY_1_EMPLOYEES,
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId2,
          name: 'Company 2',
          employees: COMPANY_2_EMPLOYEES,
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    // Create test opportunities with different stages and dates
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId1,
          stage: 'NEW',
          name: 'Opportunity 1',
          amount: { amountMicros: 1000000000000 }, // 1000
          companyId: testCompanyId1,
          closeDate: '2025-02-05T08:00:00.000Z', // Wednesday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId2,
          stage: 'NEW',
          name: 'Opportunity 2',
          amount: { amountMicros: 2000000000000 }, // 2000
          companyId: testCompanyId1,
          closeDate: '2025-02-06T08:00:00.000Z', // Thursday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId3,
          stage: 'NEW',
          name: 'Opportunity 3',
          amount: { amountMicros: 3000000000000 }, // 3000
          companyId: testCompanyId2,
          closeDate: '2025-02-06T08:00:00.000Z', // Thursday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId4,
          stage: 'SCREENING',
          name: 'Opportunity 4',
          amount: { amountMicros: 4000000000000 }, // 4000
          companyId: testCompanyId2,
          closeDate: '2025-02-06T08:00:00.000Z', // Thursday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );
  });

  afterAll(async () => {
    // Cleanup created opportunities
    for (const id of [
      testOpportunityId1,
      testOpportunityId2,
      testOpportunityId3,
      testOpportunityId4,
    ]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'opportunity',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }

    // Cleanup created companies
    for (const id of [testCompanyId1, testCompanyId2]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  it('groups by stage and closeDate with records', async () => {
    // Add query parameters for group by
    const groupByQuery = JSON.stringify([
      {
        closeDate: {
          granularity: 'DAY_OF_THE_WEEK',
        },
      },
      {
        stage: true,
      },
    ]);

    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/opportunities/groupBy?group_by=${encodeURIComponent(groupByQuery)}&aggregate=${encodeURIComponent(AGGREGATE_FIELDS)}&filter=${encodeURIComponent(FILTER_2020)}&include_records_sample=true&limit=3`,
      body: {},
    });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();

    const groups = response.body;

    expect(groups).toBeDefined();
    expect(groups).toHaveLength(3);

    groups.forEach((group: any) => {
      expect(group.groupByDimensionValues).toBeDefined();
      expect(Array.isArray(group.groupByDimensionValues)).toBe(true);
      expect(group.records).toBeDefined();
      expect(Array.isArray(group.records)).toBe(true);
    });

    const wednesdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Wednesday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(wednesdayNewGroup).toBeDefined();
    expect(wednesdayNewGroup.maxAmountAmountMicros).toBe('1000000000000');
    expect(wednesdayNewGroup.records).toHaveLength(1);
    expect(wednesdayNewGroup.records[0].name).toBe('Opportunity 1');
    expect(wednesdayNewGroup.records[0].stage).toBe('NEW');

    const thursdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Thursday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(thursdayNewGroup).toBeDefined();
    expect(thursdayNewGroup.records).toHaveLength(2);
    expect(thursdayNewGroup.maxAmountAmountMicros).toBe('3000000000000');
    const opportunity2Record = thursdayNewGroup.records.find(
      (record: any) => record.name === 'Opportunity 2',
    );
    const opportunity3Record = thursdayNewGroup.records.find(
      (record: any) => record.name === 'Opportunity 3',
    );

    expect(opportunity2Record.stage).toBe('NEW');
    expect(opportunity2Record.name).toBe('Opportunity 2');
    expect(opportunity2Record.companyId).toBe(testCompanyId1);
    expect(opportunity3Record.stage).toBe('NEW');
    expect(opportunity3Record.name).toBe('Opportunity 3');
    expect(opportunity3Record.companyId).toBe(testCompanyId2);

    const thursdayScreeningGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Thursday') &&
        group.groupByDimensionValues.includes('SCREENING'),
    );

    expect(thursdayScreeningGroup).toBeDefined();
    expect(thursdayScreeningGroup.records).toHaveLength(1);
    const opportunity4Record = thursdayScreeningGroup.records[0];

    expect(opportunity4Record.stage).toBe('SCREENING');
    expect(opportunity4Record.name).toBe('Opportunity 4');
    expect(opportunity4Record.companyId).toBe(testCompanyId2);
    expect(thursdayScreeningGroup.maxAmountAmountMicros).toBe('4000000000000');
  });

  it('groups by stage and closeDate with records and filters', async () => {
    // Test with filter to only include NEW stage opportunities
    const groupByQuery = JSON.stringify([
      {
        closeDate: {
          granularity: 'DAY_OF_THE_WEEK',
        },
      },
      {
        stage: true,
      },
    ]);

    const filterQuery = `${FILTER_2020},stage[eq]:'NEW'`;

    const response = await makeRestAPIRequest({
      method: 'get',
      path: `/opportunities/groupBy?group_by=${encodeURIComponent(groupByQuery)}&aggregate=${encodeURIComponent(AGGREGATE_FIELDS)}&filter=${encodeURIComponent(filterQuery)}&include_records_sample=true&limit=2`,
      body: {},
    });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();

    const groups = response.body;

    expect(groups).toHaveLength(2);
    const wednesdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Wednesday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(wednesdayNewGroup.groupByDimensionValues).toHaveLength(2);
    expect(wednesdayNewGroup.groupByDimensionValues).toContain('NEW');
    expect(wednesdayNewGroup.groupByDimensionValues).toContain('Wednesday');
    expect(wednesdayNewGroup.records).toHaveLength(1);
    expect(wednesdayNewGroup.records[0].stage).toBe('NEW');

    const thursdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Thursday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(thursdayNewGroup.groupByDimensionValues).toHaveLength(2);
    expect(thursdayNewGroup.groupByDimensionValues).toContain('NEW');
    expect(thursdayNewGroup.groupByDimensionValues).toContain('Thursday');
    expect(thursdayNewGroup.records).toHaveLength(2);
  });

  describe('order by for records', () => {
    const getGroupByRequestWithOrderByForRecords = (
      orderByForRecords: string,
    ) => {
      const groupByQuery = JSON.stringify([
        {
          closeDate: {
            granularity: 'DAY_OF_THE_WEEK',
          },
        },
        {
          stage: true,
        },
      ]);

      return {
        method: 'get' as const,
        path: `/opportunities/groupBy?group_by=${encodeURIComponent(groupByQuery)}&filter=${encodeURIComponent(FILTER_2020)}&order_by_for_records=${encodeURIComponent(`name[${orderByForRecords}]`)}&include_records_sample=true&limit=5`,
        body: {},
      };
    };

    it('sorts by name in ascending order', async () => {
      const response = await makeRestAPIRequest(
        getGroupByRequestWithOrderByForRecords('AscNullsFirst'),
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      const groups = response.body;

      const thursdayNewGroup = groups.find(
        (group: any) =>
          group.groupByDimensionValues.includes('Thursday') &&
          group.groupByDimensionValues.includes('NEW'),
      );

      expect(thursdayNewGroup).toBeDefined();
      expect(thursdayNewGroup.records).toHaveLength(2);
      expect(thursdayNewGroup.records[0].name).toBe('Opportunity 2');
      expect(thursdayNewGroup.records[1].name).toBe('Opportunity 3');
    });

    it('sorts by name in descending order', async () => {
      const response = await makeRestAPIRequest(
        getGroupByRequestWithOrderByForRecords('DescNullsFirst'),
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      const groups = response.body;

      const thursdayNewGroup = groups.find(
        (group: any) =>
          group.groupByDimensionValues.includes('Thursday') &&
          group.groupByDimensionValues.includes('NEW'),
      );

      expect(thursdayNewGroup).toBeDefined();
      expect(thursdayNewGroup.records).toHaveLength(2);
      expect(thursdayNewGroup.records[0].name).toBe('Opportunity 3');
      expect(thursdayNewGroup.records[1].name).toBe('Opportunity 2');
    });
  });
});
