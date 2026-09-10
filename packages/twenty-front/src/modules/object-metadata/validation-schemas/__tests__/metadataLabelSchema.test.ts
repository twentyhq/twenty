import { metadataLabelSchema } from '@/object-metadata/validation-schemas/metadataLabelSchema';

describe('metadataLabelSchema', () => {
  it('validates a valid label', () => {
    const validMetadataLabel = 'Option 1';

    const result = metadataLabelSchema().parse(validMetadataLabel);

    expect(result).toEqual(validMetadataLabel);
  });
  it('validates a label with non-latin characters', () => {
    const validMetadataLabel = 'עִבְרִי';

    const result = metadataLabelSchema().parse(validMetadataLabel);

    expect(result).toEqual(validMetadataLabel);
  });
});
