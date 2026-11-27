import { trimWorkspaceMemberName } from 'src/engine/core-modules/user/utils/trim-workspace-member-name.util';

describe('trimWorkspaceMemberName', () => {
  it('trims first and last names', () => {
    expect(
      trimWorkspaceMemberName({ firstName: '  Jane ', lastName: '\tDoe\n' }),
    ).toEqual({ firstName: 'Jane', lastName: 'Doe' });
  });

  it('leaves missing sub-fields out', () => {
    expect(trimWorkspaceMemberName({ firstName: ' Jane ' })).toEqual({
      firstName: 'Jane',
    });
  });

  it('returns non-object values unchanged', () => {
    expect(trimWorkspaceMemberName(null)).toBeNull();
    expect(trimWorkspaceMemberName('Jane')).toBe('Jane');
  });
});
