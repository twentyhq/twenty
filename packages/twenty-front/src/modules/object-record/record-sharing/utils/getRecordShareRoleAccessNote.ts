import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  ObjectSharingReach,
  RecordShareAccessLevel,
  type RecordSharingGrantDto,
} from '~/generated-metadata/graphql';

// Owners see what each grant actually gives, not only the level they picked
export const getRecordShareRoleAccessNote = ({
  share,
  sharingReach,
  objectLabelPlural,
}: {
  share: Pick<
    RecordSharingGrantDto,
    'accessLevel' | 'canRoleRead' | 'canRoleUpdate'
  >;
  sharingReach: ObjectSharingReach;
  objectLabelPlural: string;
}): string | undefined => {
  if (!isDefined(share.canRoleRead)) {
    return undefined;
  }

  if (sharingReach === ObjectSharingReach.WORKSPACE) {
    return share.canRoleRead
      ? undefined
      : t`Gets this record only: their role can't access ${objectLabelPlural}`;
  }

  if (!share.canRoleRead) {
    return t`Won't see it: their role can't access ${objectLabelPlural}`;
  }

  return share.accessLevel !== RecordShareAccessLevel.READ &&
    share.canRoleUpdate === false
    ? t`Can only view: their role can't edit ${objectLabelPlural}`
    : undefined;
};
