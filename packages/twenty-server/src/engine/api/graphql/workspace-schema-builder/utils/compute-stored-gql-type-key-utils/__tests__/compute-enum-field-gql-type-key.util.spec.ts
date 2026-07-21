import {
  computeEnumFieldGqlTypeKey,
  computeEnumFieldGqlTypeName,
  disambiguateEnumFieldGqlTypeName,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';

describe('computeEnumFieldGqlTypeKey', () => {
  it('should compute the correct key', () => {
    expect(computeEnumFieldGqlTypeName('User', 'role')).toBe('UserRoleEnum');
  });

  it('should disambiguate a generated name with the field universal identifier', () => {
    expect(
      disambiguateEnumFieldGqlTypeName(
        'AffiliatePayoutMethodEnum',
        'field-1',
      ),
    ).toBe('AffiliatePayoutMethodEnum_field1');
  });

  it('should generate unique storage keys for fields with the same generated name', () => {
    expect(
      computeEnumFieldGqlTypeKey(
        'affiliatePayout',
        'method',
        'field-1',
      ),
    ).not.toBe(
      computeEnumFieldGqlTypeKey('affiliate', 'payoutMethod', 'field-2'),
    );
  });
});
