import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';

describe('getRecordFieldKey', () => {
  it('should return the field metadata item id when there is no relation target', () => {
    expect(getRecordFieldKey({ fieldMetadataItemId: 'company-field' })).toBe(
      'company-field',
    );
    expect(
      getRecordFieldKey({
        fieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataItemId: null,
      }),
    ).toBe('company-field');
  });

  it('should combine the field and the relation target when there is one', () => {
    expect(
      getRecordFieldKey({
        fieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataItemId: 'employees-field',
      }),
    ).toBe('company-field:employees-field');
  });

  it('should give two record fields on the same relation distinct keys', () => {
    const plainCompanyKey = getRecordFieldKey({
      fieldMetadataItemId: 'company-field',
    });
    const companyEmployeesKey = getRecordFieldKey({
      fieldMetadataItemId: 'company-field',
      relationTargetFieldMetadataItemId: 'employees-field',
    });
    const companyDomainKey = getRecordFieldKey({
      fieldMetadataItemId: 'company-field',
      relationTargetFieldMetadataItemId: 'domain-field',
    });

    expect(
      new Set([plainCompanyKey, companyEmployeesKey, companyDomainKey]).size,
    ).toBe(3);
  });
});
