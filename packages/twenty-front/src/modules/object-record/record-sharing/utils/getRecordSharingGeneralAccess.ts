import { msg } from '@lingui/core/macro';

import { type RecordSharingFieldsFragment } from '~/generated-metadata/graphql';

export const getRecordSharingGeneralAccess = ({
  sharing,
  objectLabelPlural,
}: {
  sharing:
    | Pick<
        RecordSharingFieldsFragment,
        'isShareable' | 'isPrivate' | 'hasManagedGeneralAccess'
      >
    | undefined;
  objectLabelPlural: string;
}) => ({
  hasGeneralAccess:
    (sharing?.hasManagedGeneralAccess ?? false) ||
    ((sharing?.isShareable ?? false) && !sharing?.isPrivate),
  label: msg`Everyone with access to ${objectLabelPlural}`,
});
