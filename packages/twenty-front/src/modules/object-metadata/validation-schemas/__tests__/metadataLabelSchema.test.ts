import { metadataLabelSchema } from '@/object-metadata/validation-schemas/metadataLabelSchema';

describe('metadataLabelSchema', () => {
  it('validates a valid label', () => {
    // Given
    const validMetadataLabel = 'Option 1';

    // When
    const result = metadataLabelSchema().parse(validMetadataLabel);

    // Then
    expect(result).toEqual(validMetadataLabel);
  });
  it('validates a label with non-latin characters', () => {
    // Given
    const validMetadataLabel = 'עִבְרִי';

    // When
    const result = metadataLabelSchema().parse(validMetadataLabel);

    // Then
    expect(result).toEqual(validMetadataLabel);
  });
});
