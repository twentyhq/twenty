import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  type BarChartConfiguration,
  BarChartGroupMode,
  GraphOrderBy,
  type PieChartConfiguration,
} from '~/generated/graphql';
import { buildChartGroupByFieldConfigUpdate } from '@/command-menu/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';

describe('buildChartGroupByFieldConfigUpdate', () => {
  it('sets default orderBy and dateGranularity for primary axis', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'BarChartConfiguration',
      } as BarChartConfiguration,
      fieldMetadataIdKey: 'primaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'primaryAxisGroupBySubFieldName',
      fieldId: 'field',
      subFieldName: null,
    });

    expect(result).toMatchObject({
      primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
      primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
    });
  });

  it('clears orderBy and dateGranularity when primary axis fieldId is null', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'BarChartConfiguration',
      } as BarChartConfiguration,
      fieldMetadataIdKey: 'primaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'primaryAxisGroupBySubFieldName',
      fieldId: null,
      subFieldName: null,
    });

    expect(result).toMatchObject({
      primaryAxisOrderBy: null,
      primaryAxisDateGranularity: null,
    });
  });

  it('sets groupMode for bar chart secondary axis', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'BarChartConfiguration',
      } as BarChartConfiguration,
      fieldMetadataIdKey: 'secondaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'secondaryAxisGroupBySubFieldName',
      fieldId: 'field',
      subFieldName: null,
    });

    expect(result).toMatchObject({
      groupMode: BarChartGroupMode.STACKED,
    });
  });

  it('sets orderBy and dateGranularity for pie chart groupBy', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'PieChartConfiguration',
      } as PieChartConfiguration,
      fieldMetadataIdKey: 'groupByFieldMetadataId',
      subFieldNameKey: 'groupBySubFieldName',
      fieldId: 'field',
      subFieldName: null,
    });

    expect(result).toMatchObject({
      orderBy: GraphOrderBy.FIELD_ASC,
      dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
    });
  });
});
