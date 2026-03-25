import { computeCompositeFieldEnumTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-enum-type-key.util';

describe('computeCompositeFieldEnumTypeKey', () => {
  it('should compute the correct key', () => {
    expect(computeCompositeFieldEnumTypeKey('Actor', 'source')).toBe(
      'ActorSourceEnum',
    );
  });
});
