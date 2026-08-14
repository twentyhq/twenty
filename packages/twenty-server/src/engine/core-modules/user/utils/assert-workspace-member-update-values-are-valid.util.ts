import { msg } from '@lingui/core/macro';
import { UI_SCALE_VALUES } from 'twenty-shared/constants';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

// Enum-like TEXT fields whose values would otherwise be persisted unchecked,
// then cast to a client-side union.
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
