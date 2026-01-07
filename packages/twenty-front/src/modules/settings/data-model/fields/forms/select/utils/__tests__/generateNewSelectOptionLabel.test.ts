import { generateNewSelectOptionLabel } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOptionLabel';

describe('generateNewSelectOptionLabel', () => {
  it('generates a new select option label', () => {
    // Given
    const options = [
      { label: 'Option 1' },
      { label: 'Option 2' },
      { label: 'Lorem ipsum' },
    ];

    // When
    const newLabel = generateNewSelectOptionLabel(options);

    // Then
    expect(newLabel).toBe('Option 4');
  });

  it('iterates until it finds an unique label', () => {
    // Given
    const options = [
      { label: 'Option 1' },
      { label: 'Option 2' },
      { label: 'Option 4' },
      { label: 'Option 5' },
    ];

    // When
    const newLabel = generateNewSelectOptionLabel(options);

    // Then
    expect(newLabel).toBe('Option 6');
  });
});
