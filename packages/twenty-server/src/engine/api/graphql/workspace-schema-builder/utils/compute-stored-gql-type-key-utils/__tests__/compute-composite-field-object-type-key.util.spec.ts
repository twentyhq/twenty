import { FieldMetadataType } from 'twenty-shared/types';

import { computeCompositeFieldObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-object-type-key.util';

describe('computeCompositeFieldObjectTypeKey', () => {
  it('should return the correct composite field object type key', () => {
    const fieldMetadataType = FieldMetadataType.LINKS;

    const result = computeCompositeFieldObjectTypeKey(fieldMetadataType);

    expect(result).toBe('Links');
  });
});
