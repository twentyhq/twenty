import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useMemo } from 'react';

import { type MassEmailRecipient } from '@/activities/emails/mass-email/types/MassEmailRecipient';
import { type MassEmailSkippedRecipient } from '@/activities/emails/mass-email/types/MassEmailSkippedRecipient';
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

  const { recipients, skippedWithoutEmail } = useMemo(() => {
    const resolvedRecipients: MassEmailRecipient[] = [];
    const skipped: MassEmailSkippedRecipient[] = [];

    for (const record of records) {
      const placeholderValues = buildPersonPlaceholderValues(
        record as PersonRecordForPlaceholders,
      );

      const email = getPrimaryEmailFromRecord(record);

      if (email === null) {
        skipped.push({
          personId: record.id,
          displayName: placeholderValues.full_name || record.id,
        });

        continue;
      }

      resolvedRecipients.push({
        personId: record.id,
        email,
        displayName: placeholderValues.full_name || email,
        avatarUrl:
          typeof record.avatarUrl === 'string' ? record.avatarUrl : null,
        placeholderValues,
      });
    }

    return { recipients: resolvedRecipients, skippedWithoutEmail: skipped };
  }, [records]);

  return {
    recipients,
    skippedWithoutEmail,
    skippedWithoutEmailCount: skippedWithoutEmail.length,
    loading,
  };
};
