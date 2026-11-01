import { msg } from '@lingui/core/macro';

import { type RecordSharingFieldsFragment } from '~/generated-metadata/graphql';

export const getRecordSharingReadOnlyDescription = ({
  sharing,
  objectLabelPlural,
}: {
  sharing: Pick<RecordSharingFieldsFragment, 'isShareable' | 'isPrivate'>;
  objectLabelPlural: string;
}) => {
  if (!sharing.isShareable) {
    return msg`Access to ${objectLabelPlural} is set by roles, not record by record.`;
  }

  if (sharing.isPrivate) {
    return msg`Only the creator of this record and people with full access to it can change who has access.`;
  }

  return msg`Only the creator of this record, people with full access to it and admins can change who has access.`;
};
