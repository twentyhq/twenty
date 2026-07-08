import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientPerson } from '@/activities/emails/recipients/types/EmailRecipientPerson';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { getEmailRecipientPersonFromRecord } from '@/activities/emails/recipients/utils/getEmailRecipientPersonFromRecord';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export type EmailRecipientResolution = {
  person?: EmailRecipientPerson;
  workspaceMember?: PartialWorkspaceMember;
};

const escapeLikeWildcards = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export const useEmailRecipientsResolution = ({
  recipients,
}: {
  recipients: EmailRecipient[];
}) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const recipientKeys = [
    ...new Set(
      recipients.map((recipient) => getEmailRecipientKey(recipient.address)),
    ),
  ];

  const { records: matchedPeople } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: {
      or: recipientKeys.map((recipientKey) => ({
        emails: { primaryEmail: { ilike: escapeLikeWildcards(recipientKey) } },
      })),
    },
    recordGqlFields: { id: true, name: true, avatarUrl: true, emails: true },
    limit: Math.max(recipientKeys.length, 1),
    skip: recipientKeys.length === 0,
  });

  const recipientKeySet = new Set(recipientKeys);
  const resolutionByRecipientKey = new Map<string, EmailRecipientResolution>();

  for (const workspaceMember of currentWorkspaceMembers) {
    const memberKey = workspaceMember.userEmail?.toLowerCase();

    if (isDefined(memberKey) && recipientKeySet.has(memberKey)) {
      resolutionByRecipientKey.set(memberKey, { workspaceMember });
    }
  }

  for (const personRecord of matchedPeople) {
    const person = getEmailRecipientPersonFromRecord(personRecord);
    const personKey = person.primaryEmail.toLowerCase();

    if (!isNonEmptyString(personKey) || !recipientKeySet.has(personKey)) {
      continue;
    }

    resolutionByRecipientKey.set(personKey, {
      ...resolutionByRecipientKey.get(personKey),
      person,
    });
  }

  return { resolutionByRecipientKey };
};
