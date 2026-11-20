import { msg } from '@lingui/core/macro';
import { UI_SCALE_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { getWorkspaceMemberNameTooLongMessage } from 'src/engine/core-modules/user/utils/get-workspace-member-name-too-long-message.util';

// Enum-like TEXT fields would otherwise persist unchecked and then be cast to a client-side union.
const WORKSPACE_MEMBER_FIELD_ALLOWED_VALUES: Record<
  string,
  ReadonlySet<string>
> = {
  uiScale: new Set(UI_SCALE_VALUES),
};

export const assertWorkspaceMemberUpdateValuesAreValid = ({
  update,
}: {
  update: Record<string, unknown>;
}): void => {
  const nameTooLongMessage = getWorkspaceMemberNameTooLongMessage({
    name: update.name,
  });

  if (isDefined(nameTooLongMessage)) {
    throw new UserInputError('Workspace member name exceeds its max length', {
      userFriendlyMessage: nameTooLongMessage,
    });
  }

  for (const [fieldName, allowedValues] of Object.entries(
    WORKSPACE_MEMBER_FIELD_ALLOWED_VALUES,
  )) {
    if (!(fieldName in update)) {
      continue;
    }

    const value = update[fieldName];

    if (typeof value !== 'string' || !allowedValues.has(value)) {
      throw new UserInputError(
        `Invalid value for workspaceMember field ${fieldName}: ${String(value)}`,
        {
          userFriendlyMessage: msg`"${fieldName}" received an invalid value.`,
        },
      );
    }
  }
};
