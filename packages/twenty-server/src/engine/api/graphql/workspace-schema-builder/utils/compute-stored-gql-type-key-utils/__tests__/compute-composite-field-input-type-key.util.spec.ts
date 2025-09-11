import { FieldMetadataType } from 'twenty-shared/types';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/input-type-definition-kind.enum';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';

describe('computeCompositeFieldInputTypeKey', () => {
  it('should compute the correct key for FULL_NAME field', () => {
    expect(
      computeCompositeFieldInputTypeKey(
        FieldMetadataType.FULL_NAME,
        InputTypeDefinitionKind.Create,
      ),
    ).toBe('FullNameCreateInput');
  });
});
