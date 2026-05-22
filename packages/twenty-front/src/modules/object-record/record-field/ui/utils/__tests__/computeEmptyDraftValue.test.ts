import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldDateMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeEmptyDraftValue } from '@/object-record/record-field/ui/utils/computeEmptyDraftValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('computeEmptyDraftValue', () => {
  it('should return empty draft value for DATE field', () => {
    const fieldDefinition: Pick<FieldDefinition<FieldDateMetadata>, 'type'> = {
      type: FieldMetadataType.DATE,
    };

    expect(
      computeEmptyDraftValue<string>({
        fieldDefinition,
      }),
    ).toBe('');
  });
});
