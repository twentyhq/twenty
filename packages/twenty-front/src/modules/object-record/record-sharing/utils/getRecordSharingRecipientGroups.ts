import { msg } from '@lingui/core/macro';

import {
  RecordSharePrincipalType,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';

export const getRecordSharingRecipientGroups = <
  TMatchingShare extends {
    share: Pick<RecordSharingFieldsFragment['shares'][number], 'principalType'>;
  },
>({
  isInviting,
  matchingShares,
  usesRecordPermissionPolicy = false,
}: {
  isInviting: boolean;
  matchingShares: TMatchingShare[];
  usesRecordPermissionPolicy?: boolean;
}) => {
  if (isInviting) {
    return [{ heading: msg`Have access`, matchingShares }];
  }

  if (usesRecordPermissionPolicy)
    return [{ heading: msg`Shared directly`, matchingShares }];

  return [
    {
      heading: msg`Roles`,
      matchingShares: matchingShares.filter(
        ({ share }) => share.principalType === RecordSharePrincipalType.ROLE,
      ),
    },
    {
      heading: msg`Users`,
      matchingShares: matchingShares.filter(
        ({ share }) =>
          share.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER,
      ),
    },
  ];
};
