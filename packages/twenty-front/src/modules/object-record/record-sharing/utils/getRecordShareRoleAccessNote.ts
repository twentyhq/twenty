import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type RecordSharingRoleDto } from '~/generated-metadata/graphql';

// Owners see what each grant actually gives, not only the level they picked
export const getRecordShareRoleAccessNote = ({
  principalRole,
  objectLabelPlural,
}: {
  principalRole: Pick<RecordSharingRoleDto, 'canRead'> | undefined;
  objectLabelPlural: string;
}): string | undefined => {
  if (
    !isDefined(principalRole) ||
    !isDefined(principalRole.canRead) ||
    principalRole.canRead
  ) {
    return undefined;
  }

  return t`Gets this record only: their role can't access ${objectLabelPlural}`;
};
