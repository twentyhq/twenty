import { formatMetadataLabelToMetadataNameOrThrows } from '~/pages/settings/data-model/utils/format-metadata-label-to-name.util';

const VALID_STRING_PATTERN = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

describe('formatMetadataLabelToMetadataNameOrThrows', () => {
  it('leaves strings unchanged if only latin characters', () => {
    const input = 'testName';

    expect(
      formatMetadataLabelToMetadataNameOrThrows(input).match(
        VALID_STRING_PATTERN,
      )?.length,
    ).toBe(1);
    expect(formatMetadataLabelToMetadataNameOrThrows(input)).toEqual(input);
  });

  it('leaves strings unchanged if only latin characters and digits', () => {
    const input = 'testName123';

    expect(
      formatMetadataLabelToMetadataNameOrThrows(input).match(
        VALID_STRING_PATTERN,
      )?.length,
    ).toBe(1);
    expect(formatMetadataLabelToMetadataNameOrThrows(input)).toEqual(input);
  });

  it('format strings with non latin characters', () => {
    const input = 'בְרִבְרִ';
    const expected = 'bRibRi';

    expect(
      formatMetadataLabelToMetadataNameOrThrows(input).match(
        VALID_STRING_PATTERN,
      )?.length,
    ).toBe(1);
    expect(formatMetadataLabelToMetadataNameOrThrows(input)).toEqual(expected);
  });

  it('format strings with mixed characters', () => {
    const input = 'aa2בְרִבְרִ';
    const expected = 'aa2BRibRi';

    expect(
      formatMetadataLabelToMetadataNameOrThrows(input).match(
        VALID_STRING_PATTERN,
      )?.length,
    ).toBe(1);
    expect(formatMetadataLabelToMetadataNameOrThrows(input)).toEqual(expected);
  });

  it('throws error if could not format', () => {
    const input = '$$$***';

    expect(() => formatMetadataLabelToMetadataNameOrThrows(input)).toThrow();
  });
});
