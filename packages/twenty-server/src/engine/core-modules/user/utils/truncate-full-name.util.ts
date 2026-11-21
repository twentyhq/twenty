import { WORKSPACE_MEMBER_NAME_MAX_LENGTH } from 'twenty-shared/constants';
import { type FullNameMetadata } from 'twenty-shared/types';

import { trimAndTruncateToMaxCharacters } from 'src/utils/trim-and-truncate-to-max-characters.util';

export const truncateFullName = ({
  firstName,
  lastName,
}: FullNameMetadata): FullNameMetadata => ({
  firstName: trimAndTruncateToMaxCharacters({
    value: firstName,
    maxCharacters: WORKSPACE_MEMBER_NAME_MAX_LENGTH,
  }),
  lastName: trimAndTruncateToMaxCharacters({
    value: lastName,
    maxCharacters: WORKSPACE_MEMBER_NAME_MAX_LENGTH,
  }),
});
