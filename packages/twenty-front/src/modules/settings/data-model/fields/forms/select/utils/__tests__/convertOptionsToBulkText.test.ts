import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { convertOptionsToBulkText } from '@/settings/data-model/fields/forms/select/utils/convertOptionsToBulkText';

describe('convertOptionsToBulkText', () => {
  it('converts options to newline-separated text', () => {
    // Given
    const options: FieldMetadataItemOption[] = [
      {
        id: '1',
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'blue',
        position: 0,
      },
      {
        id: '2',
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'green',
        position: 1,
      },
      {
        id: '3',
        label: 'Option 3',
        value: 'OPTION_3',
        color: 'red',
        position: 2,
      },
    ];

    // When
    const result = convertOptionsToBulkText(options);

    // Then
    expect(result).toBe('Option 1\nOption 2\nOption 3');
  });

  it('returns empty string for empty options array', () => {
    // Given
    const options: FieldMetadataItemOption[] = [];

    // When
    const result = convertOptionsToBulkText(options);

    // Then
    expect(result).toBe('');
  });

  it('handles single option', () => {
    // Given
    const options: FieldMetadataItemOption[] = [
      {
        id: '1',
        label: 'Single Option',
        value: 'SINGLE_OPTION',
        color: 'blue',
        position: 0,
      },
    ];

    // When
    const result = convertOptionsToBulkText(options);

    // Then
    expect(result).toBe('Single Option');
  });

  it('preserves special characters in labels', () => {
    // Given
    const options: FieldMetadataItemOption[] = [
      {
        id: '1',
        label: 'Option with spaces',
        value: 'OPTION_WITH_SPACES',
        color: 'blue',
        position: 0,
      },
      {
        id: '2',
        label: 'Option-with-dashes',
        value: 'OPTION_WITH_DASHES',
        color: 'green',
        position: 1,
      },
      {
        id: '3',
        label: 'Option_with_underscores',
        value: 'OPTION_WITH_UNDERSCORES',
        color: 'red',
        position: 2,
      },
    ];

    // When
    const result = convertOptionsToBulkText(options);

    // Then
    expect(result).toBe(
      'Option with spaces\nOption-with-dashes\nOption_with_underscores',
    );
  });
});
