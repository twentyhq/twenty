import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getUnavailableChartFields } from '@/page-layout/widgets/graph/utils/getUnavailableChartFields';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  AggregateOperations,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const createFieldMetadataItem = (
  overrides: Partial<FieldMetadataItem>,
): FieldMetadataItem =>
  ({
    id: 'field',
    name: 'field',
    label: 'Field',
    type: FieldMetadataType.TEXT,
    isActive: true,
    isSystem: false,
    ...overrides,
  }) as FieldMetadataItem;

const amountField = createFieldMetadataItem({
  id: 'amount-id',
  label: 'Amount',
  type: FieldMetadataType.CURRENCY,
});
const stageField = createFieldMetadataItem({
  id: 'stage-id',
  label: 'Stage',
  type: FieldMetadataType.SELECT,
});
const companyField = createFieldMetadataItem({
  id: 'company-id',
  label: 'Company',
  type: FieldMetadataType.RELATION,
});

const barChartConfiguration = {
  __typename: 'BarChartConfiguration',
  configurationType: WidgetConfigurationType.BAR_CHART,
  aggregateFieldMetadataId: amountField.id,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: stageField.id,
  secondaryAxisGroupByFieldMetadataId: companyField.id,
} as PageLayoutWidget['configuration'];

describe('getUnavailableChartFields', () => {
  it('should return no field when every referenced field is active', () => {
    expect(
      getUnavailableChartFields({
        configuration: barChartConfiguration,
        fieldMetadataItems: [amountField, stageField, companyField],
      }),
    ).toEqual([]);
  });

  it('should return deactivated aggregate and group by fields', () => {
    const inactiveAmountField = { ...amountField, isActive: false };
    const inactiveCompanyField = { ...companyField, isActive: false };

    expect(
      getUnavailableChartFields({
        configuration: barChartConfiguration,
        fieldMetadataItems: [
          inactiveAmountField,
          stageField,
          inactiveCompanyField,
        ],
      }),
    ).toEqual([
      {
        fieldMetadataId: amountField.id,
        fieldMetadataItem: inactiveAmountField,
      },
      {
        fieldMetadataId: companyField.id,
        fieldMetadataItem: inactiveCompanyField,
      },
    ]);
  });

  it('should return fields missing from the object metadata', () => {
    expect(
      getUnavailableChartFields({
        configuration: barChartConfiguration,
        fieldMetadataItems: [amountField, companyField],
      }),
    ).toEqual([
      { fieldMetadataId: stageField.id, fieldMetadataItem: undefined },
    ]);
  });

  it('should check the group by field of pie charts', () => {
    const pieChartConfiguration = {
      __typename: 'PieChartConfiguration',
      configurationType: WidgetConfigurationType.PIE_CHART,
      aggregateFieldMetadataId: amountField.id,
      aggregateOperation: AggregateOperations.SUM,
      groupByFieldMetadataId: stageField.id,
    } as PageLayoutWidget['configuration'];

    const inactiveStageField = { ...stageField, isActive: false };

    expect(
      getUnavailableChartFields({
        configuration: pieChartConfiguration,
        fieldMetadataItems: [amountField, inactiveStageField],
      }),
    ).toEqual([
      {
        fieldMetadataId: stageField.id,
        fieldMetadataItem: inactiveStageField,
      },
    ]);
  });

  it('should only check the aggregate field of aggregate charts', () => {
    const aggregateChartConfiguration = {
      __typename: 'AggregateChartConfiguration',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: amountField.id,
      aggregateOperation: AggregateOperations.SUM,
    } as PageLayoutWidget['configuration'];

    expect(
      getUnavailableChartFields({
        configuration: aggregateChartConfiguration,
        fieldMetadataItems: [{ ...amountField, isActive: false }],
      }),
    ).toHaveLength(1);
  });
});
