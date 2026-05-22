import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldDateMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromString } from '@/object-record/record-field/ui/utils/computeDraftValueFromString';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('computeDraftValueFromString', () => {
  it('should return typed value for DATE field', () => {
    const fieldDefinition: Pick<FieldDefinition<FieldDateMetadata>, 'type'> = {
      type: FieldMetadataType.DATE,
    };

    expect(
      computeDraftValueFromString<string>({
        fieldDefinition,
        value: '2026-05-22',
      }),
    ).toBe('2026-05-22');
  });
});
