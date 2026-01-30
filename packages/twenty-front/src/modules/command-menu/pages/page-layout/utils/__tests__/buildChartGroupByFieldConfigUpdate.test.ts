import { type TypedBarChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedPieChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedPieChartConfiguration';
import { buildChartGroupByFieldConfigUpdate } from '@/command-menu/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  BarChartGroupMode,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated/graphql';

describe('buildChartGroupByFieldConfigUpdate', () => {
  it('sets default orderBy and dateGranularity for primary axis', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
      } as TypedBarChartConfiguration,
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
        configurationType: WidgetConfigurationType.BAR_CHART,
      } as TypedBarChartConfiguration,
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
        configurationType: WidgetConfigurationType.BAR_CHART,
      } as TypedBarChartConfiguration,
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
        configurationType: WidgetConfigurationType.PIE_CHART,
      } as TypedPieChartConfiguration,
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

  it('resets orderBy to default when field changes', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
      } as TypedBarChartConfiguration,
      fieldMetadataIdKey: 'primaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'primaryAxisGroupBySubFieldName',
      fieldId: 'new-field-id',
      subFieldName: null,
    });

    expect(result).toMatchObject({
      primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
    });
  });
});
