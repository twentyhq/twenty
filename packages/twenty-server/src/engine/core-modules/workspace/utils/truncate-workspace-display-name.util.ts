import { WORKSPACE_DISPLAY_NAME_MAX_LENGTH } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { trimAndTruncateToMaxCharacters } from 'src/utils/trim-and-truncate-to-max-characters.util';

export const truncateWorkspaceDisplayName = (
  displayName: string | undefined,
): string | undefined =>
  isDefined(displayName)
    ? trimAndTruncateToMaxCharacters({
        value: displayName,
        maxCharacters: WORKSPACE_DISPLAY_NAME_MAX_LENGTH,
      })
    : undefined;
