import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldMultiSelectMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('computeDraftValueFromFieldValue', () => {
  const multiSelectFieldDefinition: Pick<
    FieldDefinition<FieldMetadata>,
    'type' | 'metadata'
  > = {
    type: FieldMetadataType.MULTI_SELECT,
    metadata: {
      fieldName: 'investorType',
      options: [
        {
          label: 'Angel',
          value: 'ANGEL',
          color: 'blue',
        },
      ],
    } as FieldMultiSelectMetadata,
  };

  it('should keep valid multi-select array values', () => {
    const draftValue = computeDraftValueFromFieldValue({
      fieldDefinition: multiSelectFieldDefinition,
      fieldValue: ['ANGEL'],
    });

    expect(draftValue).toEqual(['ANGEL']);
  });

  it('should reset malformed multi-select scalar values to null', () => {
    const draftValue = computeDraftValueFromFieldValue({
      fieldDefinition: multiSelectFieldDefinition,
      fieldValue: 'ANGEL',
    });

    expect(draftValue).toBeNull();
  });
});
