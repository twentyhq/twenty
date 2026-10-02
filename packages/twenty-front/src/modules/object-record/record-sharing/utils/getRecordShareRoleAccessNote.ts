import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  ObjectSharingReach,
  RecordShareAccessLevel,
  type RecordSharingRoleDto,
} from '~/generated-metadata/graphql';

// Owners see what each grant actually gives, not only the level they picked
export const getRecordShareRoleAccessNote = ({
  accessLevel,
  principalRole,
  sharingReach,
  objectLabelPlural,
}: {
  accessLevel: RecordShareAccessLevel;
  principalRole:
    | Pick<RecordSharingRoleDto, 'canRead' | 'canUpdate'>
    | undefined;
  sharingReach: ObjectSharingReach;
  objectLabelPlural: string;
}): string | undefined => {
  if (!isDefined(principalRole)) {
    return undefined;
  }

  if (sharingReach === ObjectSharingReach.WORKSPACE) {
    return principalRole.canRead
      ? undefined
      : t`Gets this record only: their role can't access ${objectLabelPlural}`;
  }

  if (!principalRole.canRead) {
    return t`Won't see it: their role can't access ${objectLabelPlural}`;
  }

  return accessLevel !== RecordShareAccessLevel.READ && !principalRole.canUpdate
    ? t`Can only view: their role can't edit ${objectLabelPlural}`
    : undefined;
};
