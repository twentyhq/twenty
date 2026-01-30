import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { convertBulkTextToOptions } from '@/settings/data-model/fields/forms/select/utils/convertBulkTextToOptions';

describe('convertBulkTextToOptions', () => {
  it('converts newline-separated text to options', () => {
    // Given
    const text = 'Option 1\nOption 2\nOption 3';
    const currentOptions: FieldMetadataItemOption[] = [];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(3);
    expect(result[0].label).toBe('Option 1');
    expect(result[0].position).toBe(0);
    expect(result[1].label).toBe('Option 2');
    expect(result[1].position).toBe(1);
    expect(result[2].label).toBe('Option 3');
    expect(result[2].position).toBe(2);
  });

  it('returns empty array for empty text', () => {
    // Given
    const text = '';
    const currentOptions: FieldMetadataItemOption[] = [];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(0);
  });

  it('returns empty array for whitespace-only text', () => {
    // Given
    const text = '   \n   \n   ';
    const currentOptions: FieldMetadataItemOption[] = [];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(0);
  });

  it('trims whitespace from lines', () => {
    // Given
    const text = '  Option 1  \n  Option 2  ';
    const currentOptions: FieldMetadataItemOption[] = [];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Option 1');
    expect(result[1].label).toBe('Option 2');
  });

  it('filters out empty lines', () => {
    // Given
    const text = 'Option 1\n\n\nOption 2\n\nOption 3';
    const currentOptions: FieldMetadataItemOption[] = [];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(3);
    expect(result[0].label).toBe('Option 1');
    expect(result[1].label).toBe('Option 2');
    expect(result[2].label).toBe('Option 3');
  });

  it('preserves existing option metadata when label matches (case-insensitive)', () => {
    // Given
    const text = 'option 1\nOption 2';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'existing-id-1',
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'blue',
        position: 0,
      },
      {
        id: 'existing-id-2',
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'green',
        position: 1,
      },
    ];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('existing-id-1');
    expect(result[0].color).toBe('blue');
    expect(result[0].label).toBe('Option 1'); // preserves original label casing
    expect(result[0].position).toBe(0);
    expect(result[1].id).toBe('existing-id-2');
    expect(result[1].color).toBe('green');
    expect(result[1].label).toBe('Option 2'); // preserves original label casing
    expect(result[1].position).toBe(1);
  });

  it('creates new options for labels that do not exist', () => {
    // Given
    const text = 'Existing Option\nNew Option';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'existing-id',
        label: 'Existing Option',
        value: 'EXISTING_OPTION',
        color: 'blue',
        position: 0,
      },
    ];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('existing-id');
    expect(result[1].label).toBe('New Option');
    expect(result[1].id).toBeDefined();
    expect(result[1].id).not.toBe('existing-id');
  });

  it('updates positions correctly when reordering', () => {
    // Given
    const text = 'Option 2\nOption 1';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'id-1',
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'blue',
        position: 0,
      },
      {
        id: 'id-2',
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'green',
        position: 1,
      },
    ];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('id-2');
    expect(result[0].position).toBe(0);
    expect(result[1].id).toBe('id-1');
    expect(result[1].position).toBe(1);
  });

  it('handles mixed existing and new options', () => {
    // Given
    const text = 'Existing\nNew 1\nAnother Existing\nNew 2';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'existing-1',
        label: 'Existing',
        value: 'EXISTING',
        color: 'blue',
        position: 0,
      },
      {
        id: 'existing-2',
        label: 'Another Existing',
        value: 'ANOTHER_EXISTING',
        color: 'red',
        position: 1,
      },
    ];

    // When
    const result = convertBulkTextToOptions(text, currentOptions);

    // Then
    expect(result).toHaveLength(4);
    expect(result[0].id).toBe('existing-1');
    expect(result[0].position).toBe(0);
    expect(result[1].label).toBe('New 1');
    expect(result[1].position).toBe(1);
    expect(result[2].id).toBe('existing-2');
    expect(result[2].position).toBe(2);
    expect(result[3].label).toBe('New 2');
    expect(result[3].position).toBe(3);
  });
});
