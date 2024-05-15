import { METADATA_NAME_VALID_STRING_PATTERN } from '~/pages/settings/data-model/utils/constants.utils';
import { formatLabelOrThrows } from '~/pages/settings/data-model/utils/format-label.util';

const regex = METADATA_NAME_VALID_STRING_PATTERN;
describe('formatLabelOrThrows', () => {
  it('leaves strings unchanged if only latin characters', () => {
    const input = 'testName';

    expect(formatLabelOrThrows(input, regex).match(regex)?.length).toBe(1);
    expect(formatLabelOrThrows(input, regex)).toEqual(input);
  });

  it('leaves strings unchanged if only latin characters and digits', () => {
    const input = 'testName123';

    expect(formatLabelOrThrows(input, regex).match(regex)?.length).toBe(1);
    expect(formatLabelOrThrows(input, regex)).toEqual(input);
  });

  it('format strings with non latin characters', () => {
    const input = 'בְרִבְרִ';
    const expected = 'bRibRi';

    expect(formatLabelOrThrows(input, regex).match(regex)?.length).toBe(1);
    expect(formatLabelOrThrows(input, regex)).toEqual(expected);
  });

  it('format strings with mixed characters', () => {
    const input = 'aa2בְרִבְרִ';
    const expected = 'aa2BRibRi';

    expect(formatLabelOrThrows(input, regex).match(regex)?.length).toBe(1);
    expect(formatLabelOrThrows(input, regex)).toEqual(expected);
  });

  it('throws error if could not format', () => {
    const input = '$$$***';

    expect(() => formatLabelOrThrows(input, regex)).toThrow();
  });
});
