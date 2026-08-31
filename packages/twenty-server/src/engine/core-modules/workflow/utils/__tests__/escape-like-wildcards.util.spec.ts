import { escapeLikeWildcards } from 'src/engine/core-modules/workflow/utils/escape-like-wildcards.util';

describe('escapeLikeWildcards', () => {
  it('should leave plain text unchanged', () => {
    expect(escapeLikeWildcards('Send invoice')).toBe('Send invoice');
  });

  it('should escape percent and underscore wildcards', () => {
    expect(escapeLikeWildcards('100%_done')).toBe('100\\%\\_done');
  });

  it('should escape backslashes before they escape anything else', () => {
    expect(escapeLikeWildcards('a\\%b')).toBe('a\\\\\\%b');
  });
});
