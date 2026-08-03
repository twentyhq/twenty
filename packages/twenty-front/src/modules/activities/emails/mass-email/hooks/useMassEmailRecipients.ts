import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useMemo } from 'react';

import { type MassEmailRecipient } from '@/activities/emails/mass-email/types/MassEmailRecipient';
import {
  buildPersonPlaceholderValues,
  type PersonRecordForPlaceholders,
} from '@/activities/emails/mass-email/utils/emailPlaceholders';
import { getPrimaryEmailFromRecord } from '@/activities/emails/utils/getPrimaryEmailFromRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useMassEmailRecipients = (personIds: string[]) => {
  const { records, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: { id: { in: personIds } },
    recordGqlFields: {
      id: true,
      name: true,
      emails: true,
      avatarUrl: true,
      jobTitle: true,
      city: true,
      company: { id: true, name: true },
    },
    limit: MAX_EMAIL_RECIPIENTS,
    skip: personIds.length === 0,
  });

  const recipients: MassEmailRecipient[] = useMemo(
    () =>
      records.flatMap((record) => {
        const email = getPrimaryEmailFromRecord(record);

        if (email === null) {
          return [];
        }

        const placeholderValues = buildPersonPlaceholderValues(
          record as PersonRecordForPlaceholders,
        );

        return [
          {
            personId: record.id,
            email,
            displayName: placeholderValues.full_name || email,
            avatarUrl:
              typeof record.avatarUrl === 'string' ? record.avatarUrl : null,
            placeholderValues,
          },
        ];
      }),
    [records],
  );

  return {
    recipients,
    skippedWithoutEmailCount: records.length - recipients.length,
    loading,
  };
};
