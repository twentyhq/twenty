import {
  METADATA_LABEL_VALID_STRING_PATTERN,
  METADATA_NAME_VALID_STRING_PATTERN,
  OPTION_VALUE_VALID_STRING_PATTERN,
} from '~/pages/settings/data-model/utils/constants.utils';

describe('METADATA_NAME_VALID_STRING_PATTERN', () => {
  it('does not match empty string', () => {
    const input = ' ';

    expect(input.match(METADATA_NAME_VALID_STRING_PATTERN)).toBeNull();
  });

  it('matches 1 char long string', () => {
    const input = 'a';

    expect(input.match(METADATA_NAME_VALID_STRING_PATTERN)).toHaveLength(1);
  });

  it('does not match string starting with digits', () => {
    const input = '1string';

    expect(input.match(METADATA_NAME_VALID_STRING_PATTERN)).toBeNull();
  });

  it('does not match string with non-latin char', () => {
    const input = 'λλλ';

    expect(input.match(METADATA_NAME_VALID_STRING_PATTERN)).toBeNull();
  });
});

describe('METADATA_LABEL_VALID_STRING_PATTERN', () => {
  it('does not match empty string', () => {
    const input = ' ';

    expect(input.match(METADATA_LABEL_VALID_STRING_PATTERN)).toBeNull();
  });

  it('matches 1 char long string', () => {
    const input = 'a';

    expect(input.match(METADATA_LABEL_VALID_STRING_PATTERN)).toHaveLength(1);
  });

  it('does not match string starting with digits', () => {
    const input = '1string';

    expect(input.match(METADATA_LABEL_VALID_STRING_PATTERN)).toBeNull();
  });

  it('matches string with non-latin char', () => {
    const input = 'λλλ';

    expect(input.match(METADATA_LABEL_VALID_STRING_PATTERN)).toHaveLength(1);
  });
});

describe('OPTION_VALUE_VALID_STRING_PATTERN', () => {
  it('does not match empty string', () => {
    const input = ' ';

    expect(input.match(OPTION_VALUE_VALID_STRING_PATTERN)).toBeNull();
  });

  it('matches 1 char long string', () => {
    const input = 'a';

    expect(input.match(OPTION_VALUE_VALID_STRING_PATTERN)).toHaveLength(1);
  });

  it('matches string starting with digits', () => {
    const input = '1string';

    expect(input.match(OPTION_VALUE_VALID_STRING_PATTERN)).toHaveLength(1);
  });

  it('matches string with non-latin char', () => {
    const input = 'λλλ';

    expect(input.match(OPTION_VALUE_VALID_STRING_PATTERN)).toHaveLength(1);
  });
});
