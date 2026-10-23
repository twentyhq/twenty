import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  RecordShareAccessLevel,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';

export const getRecordSharingGeneralAccess = ({
  sharing,
  workspaceName,
}: {
  sharing:
    | Pick<
        RecordSharingFieldsFragment,
        'generalAccessLevel' | 'hasManagedGeneralAccess'
      >
    | undefined;
  workspaceName: string;
}) => ({
  hasGeneralAccess:
    (sharing?.hasManagedGeneralAccess ?? false) ||
    (isDefined(sharing?.generalAccessLevel) &&
      sharing.generalAccessLevel !== RecordShareAccessLevel.NONE),
  label: msg`Everyone at ${workspaceName}`,
});
