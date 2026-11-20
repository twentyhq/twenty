import { WORKSPACE_MEMBER_NAME_MAX_LENGTH } from 'twenty-shared/constants';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { assertWorkspaceMemberNameIsWithinMaxLength } from 'src/engine/core-modules/user/utils/assert-workspace-member-name-is-within-max-length.util';

const NAME_AT_LIMIT = 'a'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH);
const NAME_OVER_LIMIT = 'a'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH + 1);

describe('assertWorkspaceMemberNameIsWithinMaxLength', () => {
  it('should accept names at the limit', () => {
    expect(() =>
      assertWorkspaceMemberNameIsWithinMaxLength({
        name: { firstName: NAME_AT_LIMIT, lastName: NAME_AT_LIMIT },
      }),
    ).not.toThrow();
  });

  it('should ignore surrounding whitespace', () => {
    expect(() =>
      assertWorkspaceMemberNameIsWithinMaxLength({
        name: { firstName: `  ${NAME_AT_LIMIT}  ` },
      }),
    ).not.toThrow();
  });

  it('should count characters rather than UTF-16 code units', () => {
    expect(() =>
      assertWorkspaceMemberNameIsWithinMaxLength({
        name: { firstName: '😀'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH) },
      }),
    ).not.toThrow();

    expect(() =>
      assertWorkspaceMemberNameIsWithinMaxLength({
        name: { firstName: '😀'.repeat(WORKSPACE_MEMBER_NAME_MAX_LENGTH + 1) },
      }),
    ).toThrow(UserInputError);
  });

  it.each(['firstName', 'lastName'])(
    'should reject a %s over the limit',
    (subFieldName) => {
      expect(() =>
        assertWorkspaceMemberNameIsWithinMaxLength({
          name: { [subFieldName]: NAME_OVER_LIMIT },
        }),
      ).toThrow(UserInputError);
    },
  );

  it.each([undefined, null, 'Jane', { firstName: 42 }])(
    'should leave non-string name values %p to other validation',
    (name) => {
      expect(() =>
        assertWorkspaceMemberNameIsWithinMaxLength({ name }),
      ).not.toThrow();
    },
  );
});
