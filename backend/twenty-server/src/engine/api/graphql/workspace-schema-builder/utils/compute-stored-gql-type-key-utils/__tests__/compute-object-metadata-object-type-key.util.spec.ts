import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';

describe('computeObjectMetadataObjectTypeKey', () => {
  it('should compute the correct key for user object with Plain kind', () => {
    expect(
      computeObjectMetadataObjectTypeKey(
        'user',
        ObjectTypeDefinitionKind.Plain,
      ),
    ).toBe('User');
  });
});
