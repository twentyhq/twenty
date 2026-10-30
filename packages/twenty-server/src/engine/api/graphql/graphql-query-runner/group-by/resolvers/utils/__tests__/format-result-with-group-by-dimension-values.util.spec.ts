import { type ObjectRecord } from 'twenty-shared/types';

import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';
import { formatResultWithGroupByDimensionValues } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/format-result-with-group-by-dimension-values.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

jest.mock('src/engine/twenty-orm/utils/format-result.util', () => ({
  formatResult: (record: Record<string, unknown>) => record,
}));

const stageDefinition: GroupByDefinition = {
  columnNameWithQuotes: '"opportunity"."stage"',
  expression: '"opportunity"."stage"',
  alias: 'opportunity_stage',
};

const metadata = {
  flatObjectMetadata: {} as FlatObjectMetadata,
  flatObjectMetadataMaps: {} as FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: {} as FlatEntityMaps<OrmFlatFieldMetadata>,
  processRecord: async (record: ObjectRecord) => record,
};

describe('formatResultWithGroupByDimensionValues', () => {
  it('should return an empty page for a group the records query left out', async () => {
    const result = await formatResultWithGroupByDimensionValues({
      groupsResult: [
        { opportunity_stage: 'NEW' },
        { opportunity_stage: 'SCREENING' },
        { opportunity_stage: null },
      ],
      groupByDefinitions: [stageDefinition],
      aggregateFieldNames: [],
      recordsResult: [
        { opportunity_stage: 'SCREENING', records: [{ id: 'record-1' }] },
      ],
      ...metadata,
    });

    expect(result).toEqual([
      { groupByDimensionValues: ['NEW'], records: [] },
      { groupByDimensionValues: ['SCREENING'], records: [{ id: 'record-1' }] },
      { groupByDimensionValues: [null], records: [] },
    ]);
  });
});
