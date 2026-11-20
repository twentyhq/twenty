import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { WORKSPACE_MEMBER_NAME_MAX_LENGTH } from 'twenty-shared/constants';
import { isPlainObject } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const NAME_TOO_LONG_MESSAGE_BY_SUB_FIELD_NAME = {
  firstName: msg`First name must be at most ${WORKSPACE_MEMBER_NAME_MAX_LENGTH} characters.`,
  lastName: msg`Last name must be at most ${WORKSPACE_MEMBER_NAME_MAX_LENGTH} characters.`,
};

export const assertWorkspaceMemberNameIsWithinMaxLength = ({
  name,
}: {
  name: unknown;
}): void => {
  if (!isPlainObject(name)) {
    return;
  }

  for (const [subFieldName, userFriendlyMessage] of Object.entries(
    NAME_TOO_LONG_MESSAGE_BY_SUB_FIELD_NAME,
  )) {
    const value = name[subFieldName];

    if (
      isString(value) &&
      Array.from(value.trim()).length > WORKSPACE_MEMBER_NAME_MAX_LENGTH
    ) {
      throw new UserInputError(
        `workspaceMember name.${subFieldName} exceeds ${WORKSPACE_MEMBER_NAME_MAX_LENGTH} characters`,
        { userFriendlyMessage },
      );
    }
  }
};
