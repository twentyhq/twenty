import { type TypedBarChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedLineChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedLineChartConfiguration';
import { type TypedPieChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedPieChartConfiguration';
import { buildChartGroupByFieldConfigUpdate } from '@/command-menu/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import {
  BarChartGroupMode,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

describe('buildChartGroupByFieldConfigUpdate', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'object-id',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    labelSingular: 'Opportunity',
    labelPlural: 'Opportunities',
    description: 'An opportunity',
    icon: 'IconTargetArrow',
    isActive: true,
    isSystem: false,
    isRemote: false,
    isAuditLogged: false,
    isLabelSyncedWithName: true,
    fields: [
      {
        id: 'text-field-id',
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
      },
      {
        id: 'array-field-id',
        name: 'tags',
        label: 'Tags',
        type: FieldMetadataType.MULTI_SELECT,
      },
      {
        id: 'array-field-id-2',
        name: 'skills',
        label: 'Skills',
        type: FieldMetadataType.ARRAY,
      },
    ],
  } as any;

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

  it('disables split multi-value fields for bar charts when both axes are arrays', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        splitMultiValueFields: true,
        primaryAxisGroupByFieldMetadataId: 'array-field-id',
      } as TypedBarChartConfiguration,
      fieldMetadataIdKey: 'secondaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'secondaryAxisGroupBySubFieldName',
      fieldId: 'array-field-id-2',
      subFieldName: null,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toMatchObject({
      splitMultiValueFields: false,
    });
  });

  it('disables split multi-value fields for line charts when both axes are arrays', () => {
    const result = buildChartGroupByFieldConfigUpdate({
      configuration: {
        __typename: 'LineChartConfiguration',
        configurationType: WidgetConfigurationType.LINE_CHART,
        splitMultiValueFields: true,
        secondaryAxisGroupByFieldMetadataId: 'array-field-id-2',
      } as TypedLineChartConfiguration,
      fieldMetadataIdKey: 'primaryAxisGroupByFieldMetadataId',
      subFieldNameKey: 'primaryAxisGroupBySubFieldName',
      fieldId: 'array-field-id',
      subFieldName: null,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toMatchObject({
      splitMultiValueFields: false,
    });
  });
});
