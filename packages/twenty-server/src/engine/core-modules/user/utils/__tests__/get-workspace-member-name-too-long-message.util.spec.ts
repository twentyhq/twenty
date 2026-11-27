import { WORKSPACE_MEMBER_NAME_MAX_LENGTH } from 'twenty-shared/constants';

import { getWorkspaceMemberNameTooLongMessage } from 'src/engine/core-modules/user/utils/get-workspace-member-name-too-long-message.util';

const NAME_AT_LIMIT = 'a'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH);
const NAME_OVER_LIMIT = 'a'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH + 1);

describe('getWorkspaceMemberNameTooLongMessage', () => {
  it('should accept names at the limit', () => {
    expect(
      getWorkspaceMemberNameTooLongMessage({
        name: { firstName: NAME_AT_LIMIT, lastName: NAME_AT_LIMIT },
      }),
    ).toBeUndefined();
  });

  it('should ignore surrounding whitespace', () => {
    expect(
      getWorkspaceMemberNameTooLongMessage({
        name: { firstName: `  ${NAME_AT_LIMIT}  ` },
      }),
    ).toBeUndefined();
  });

  it('should count characters rather than UTF-16 code units', () => {
    expect(
      getWorkspaceMemberNameTooLongMessage({
        name: { firstName: '😀'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH) },
      }),
    ).toBeUndefined();

    expect(
      getWorkspaceMemberNameTooLongMessage({
        name: { firstName: '😀'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH + 1) },
      }),
    ).toBeDefined();
  });

  it.each([
    ['firstName', 'First name'],
    ['lastName', 'Last name'],
  ])('should name the %s in the message', (subFieldName, label) => {
    expect(
      getWorkspaceMemberNameTooLongMessage({
        name: { [subFieldName]: NAME_OVER_LIMIT },
      })?.message,
    ).toContain(label);
  });

  it.each([undefined, null, 'Jane', { firstName: 42 }])(
    'should leave non-string name values %p to other validation',
    (name) => {
      expect(getWorkspaceMemberNameTooLongMessage({ name })).toBeUndefined();
    },
  );
});
