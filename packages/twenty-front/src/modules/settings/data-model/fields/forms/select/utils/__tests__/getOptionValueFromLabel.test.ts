import { getOptionValueFromLabel } from '../getOptionValueFromLabel';

describe('getOptionValueFromLabel', () => {
  it('should return the option value from the label', () => {
    const label = 'Example Label';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });

  it('should handle labels with accents', () => {
    const label = 'Éxàmplè Làbèl';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });

  it('should handle labels with special characters', () => {
    const label = 'Example!@#$%^&*() Label';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });

  it('should handle labels with emojis', () => {
    const label = '📱 Example Label';
    const expected = 'EXAMPLE_LABEL';

    const result = getOptionValueFromLabel(label);

    expect(result).toEqual(expected);
  });
});
