import { getUnavailableChartFields } from '@/page-layout/widgets/graph/utils/getUnavailableChartFields';

const amountField = { id: 'amount-id', label: 'Amount', isActive: true };
const stageField = { id: 'stage-id', label: 'Stage', isActive: true };
const companyField = { id: 'company-id', label: 'Company', isActive: true };

describe('getUnavailableChartFields', () => {
  it('should return no field when every chart field is active', () => {
    expect(
      getUnavailableChartFields({
        fieldMetadataIds: [amountField.id, stageField.id, companyField.id],
        fieldMetadataItems: [amountField, stageField, companyField],
      }),
    ).toEqual([]);
  });

  it('should return deactivated chart fields', () => {
    const inactiveAmountField = { ...amountField, isActive: false };
    const inactiveCompanyField = { ...companyField, isActive: false };

    expect(
      getUnavailableChartFields({
        fieldMetadataIds: [amountField.id, stageField.id, companyField.id],
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

  it('should return chart fields missing from the object metadata', () => {
    expect(
      getUnavailableChartFields({
        fieldMetadataIds: [amountField.id, stageField.id],
        fieldMetadataItems: [amountField],
      }),
    ).toEqual([
      { fieldMetadataId: stageField.id, fieldMetadataItem: undefined },
    ]);
  });

  it('should report a field used twice only once', () => {
    const inactiveAmountField = { ...amountField, isActive: false };

    expect(
      getUnavailableChartFields({
        fieldMetadataIds: [amountField.id, amountField.id],
        fieldMetadataItems: [inactiveAmountField],
      }),
    ).toHaveLength(1);
  });
});
