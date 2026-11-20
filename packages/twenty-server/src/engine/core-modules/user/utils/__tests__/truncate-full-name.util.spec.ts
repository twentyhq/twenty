import { WORKSPACE_MEMBER_NAME_MAX_LENGTH } from 'twenty-shared/constants';

import { truncateFullName } from 'src/engine/core-modules/user/utils/truncate-full-name.util';

describe('truncateFullName', () => {
  it('should keep names within the limit', () => {
    expect(truncateFullName({ firstName: 'Jane', lastName: 'Doe' })).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  it('should cut each name part to the limit independently', () => {
    const longName = 'a'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH + 20);

    expect(
      truncateFullName({ firstName: longName, lastName: longName }),
    ).toEqual({
      firstName: 'a'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH),
      lastName: 'a'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH),
    });
  });
});
