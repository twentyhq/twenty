import { formatMetadataLabel } from '~/pages/settings/data-model/utils/format-metadata-label.util';

const VALID_STRING_PATTERN = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

describe('formatMetadataLabel', () => {
  it('leaves strings unchanged if only latin characters', () => {
    const input = 'testName';

    expect(formatMetadataLabel(input).match(VALID_STRING_PATTERN)?.length).toBe(
      1,
    );
    expect(formatMetadataLabel(input)).toEqual(input);
  });

  it('leaves strings unchanged if only latin characters and digits', () => {
    const input = 'testName123';

    expect(formatMetadataLabel(input).match(VALID_STRING_PATTERN)?.length).toBe(
      1,
    );
    expect(formatMetadataLabel(input)).toEqual(input);
  });

  it('format strings with non latin characters', () => {
    const input = 'בְרִבְרִ';
    const expected = 'bRibRi';

    expect(formatMetadataLabel(input).match(VALID_STRING_PATTERN)?.length).toBe(
      1,
    );
    expect(formatMetadataLabel(input)).toEqual(expected);
  });

  it('format strings with mixed characters', () => {
    const input = 'aa2בְרִבְרִ';
    const expected = 'aa2BRibRi';

    expect(formatMetadataLabel(input).match(VALID_STRING_PATTERN)?.length).toBe(
      1,
    );
    expect(formatMetadataLabel(input)).toEqual(expected);
  });
});
