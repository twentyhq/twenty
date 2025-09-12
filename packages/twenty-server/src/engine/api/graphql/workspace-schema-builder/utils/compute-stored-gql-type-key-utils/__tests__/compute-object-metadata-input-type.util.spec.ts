import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';

describe('computeObjectMetadataInputTypeKey', () => {
  it('should compute the correct key for user object with Create kind', () => {
    expect(
      computeObjectMetadataInputTypeKey(
        'user',
        GqlInputTypeDefinitionKind.Create,
      ),
    ).toBe('UserCreateInput');
  });
});
