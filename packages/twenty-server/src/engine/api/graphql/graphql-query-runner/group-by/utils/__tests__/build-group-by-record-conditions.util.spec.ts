import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';
import { buildGroupByRecordConditions } from 'src/engine/api/graphql/graphql-query-runner/group-by/utils/build-group-by-record-conditions.util';

const stageDefinition: GroupByDefinition = {
  columnNameWithQuotes: '"opportunity"."stage"',
  expression: '"opportunity"."stage"',
  alias: 'opportunity_stage',
};

const companyDefinition: GroupByDefinition = {
  columnNameWithQuotes: '"opportunity"."companyId"',
  expression: '"opportunity"."companyId"',
  alias: 'opportunity_companyId',
};

describe('buildGroupByRecordConditions', () => {
  it('should scope a single dimension with one IN list', () => {
    const result = buildGroupByRecordConditions({
      groupsResult: [
        { opportunity_stage: 'NEW' },
        { opportunity_stage: 'SCREENING' },
      ],
      groupByDefinitions: [stageDefinition],
    });

    expect(result).toEqual({
      sql: '("opportunity"."stage" IN (:...groupValues_0))',
      parameters: { groupValues_0: ['NEW', 'SCREENING'] },
    });
  });

  it('should add an IS NULL branch for the null group of a single dimension', () => {
    const result = buildGroupByRecordConditions({
      groupsResult: [{ opportunity_stage: 'NEW' }, { opportunity_stage: null }],
      groupByDefinitions: [stageDefinition],
    });

    expect(result).toEqual({
      sql: '("opportunity"."stage" IN (:...groupValues_0) OR "opportunity"."stage" IS NULL)',
      parameters: { groupValues_0: ['NEW'] },
    });
  });

  it('should only emit IS NULL when the null group is the only group', () => {
    const result = buildGroupByRecordConditions({
      groupsResult: [{ opportunity_stage: null }],
      groupByDefinitions: [stageDefinition],
    });

    expect(result).toEqual({
      sql: '("opportunity"."stage" IS NULL)',
      parameters: {},
    });
  });

  it('should keep one equality branch per group across several dimensions', () => {
    const result = buildGroupByRecordConditions({
      groupsResult: [
        { opportunity_stage: 'NEW', opportunity_companyId: 'company-1' },
        { opportunity_stage: 'NEW', opportunity_companyId: null },
      ],
      groupByDefinitions: [stageDefinition, companyDefinition],
    });

    expect(result).toEqual({
      sql:
        '(("opportunity"."stage" = :groupValue_0_0 AND "opportunity"."companyId" = :groupValue_0_1) OR ' +
        '("opportunity"."stage" = :groupValue_1_0 AND "opportunity"."companyId" IS NULL))',
      parameters: {
        groupValue_0_0: 'NEW',
        groupValue_0_1: 'company-1',
        groupValue_1_0: 'NEW',
      },
    });
  });
});
