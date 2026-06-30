import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';

describe('computeEnumFieldGqlTypeKey', () => {
  it('should compute the correct key', () => {
    expect(computeEnumFieldGqlTypeKey('User', 'role')).toBe('UserRoleEnum');
  });
});
