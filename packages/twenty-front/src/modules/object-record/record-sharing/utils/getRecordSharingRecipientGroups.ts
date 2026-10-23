import { msg } from '@lingui/core/macro';

import {
  RecordSharePrincipalType,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';

export const getRecordSharingRecipientGroups = ({
  isInviting,
  shares,
}: {
  isInviting: boolean;
  shares: RecordSharingFieldsFragment['shares'];
}) => {
  if (isInviting) {
    return [{ heading: msg`Have access`, shares }];
  }

  return [
    {
      heading: msg`Roles`,
      shares: shares.filter(
        (share) => share.principalType === RecordSharePrincipalType.ROLE,
      ),
    },
    {
      heading: msg`Users`,
      shares: shares.filter(
        (share) =>
          share.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER,
      ),
    },
  ];
};
