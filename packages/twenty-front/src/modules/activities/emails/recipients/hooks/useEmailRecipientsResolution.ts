import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { escapeForIlike } from 'twenty-shared/utils';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientPerson } from '@/activities/emails/recipients/types/EmailRecipientPerson';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { getEmailRecipientPersonFromRecord } from '@/activities/emails/recipients/utils/getEmailRecipientPersonFromRecord';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export type EmailRecipientResolution = {
  person?: EmailRecipientPerson;
  workspaceMember?: Pick<PartialWorkspaceMember, 'id' | 'name' | 'avatarUrl'>;
};

export const useEmailRecipientsResolution = ({
  recipients,
}: {
  recipients: EmailRecipient[];
}): { resolutionByRecipientKey: Map<string, EmailRecipientResolution> } => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const recipientKeys = [
    ...new Set(
      recipients
        .filter((recipient) => isValidEmailRecipientAddress(recipient.address))
        .map((recipient) => getEmailRecipientKey(recipient.address)),
    ),
  ];

  const { records: matchedPersonRecords } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: {
      or: recipientKeys.map((recipientKey) => ({
        emails: { primaryEmail: { ilike: escapeForIlike(recipientKey) } },
      })),
    },
    recordGqlFields: { id: true, name: true, avatarUrl: true, emails: true },
    limit: MAX_EMAIL_RECIPIENTS,
    skip: recipientKeys.length === 0,
  });

  const recipientKeySet = new Set(recipientKeys);
  const resolutionByRecipientKey = new Map<string, EmailRecipientResolution>();

  for (const matchedPersonRecord of matchedPersonRecords) {
    const person = getEmailRecipientPersonFromRecord(matchedPersonRecord);
    const personKey = getEmailRecipientKey(person.emails.primaryEmail);

    if (recipientKeySet.has(personKey)) {
      resolutionByRecipientKey.set(personKey, { person });
    }
  }

  for (const workspaceMember of currentWorkspaceMembers) {
    const workspaceMemberKey = getEmailRecipientKey(workspaceMember.userEmail);

    if (recipientKeySet.has(workspaceMemberKey)) {
      resolutionByRecipientKey.set(workspaceMemberKey, {
        ...resolutionByRecipientKey.get(workspaceMemberKey),
        workspaceMember: {
          id: workspaceMember.id,
          name: workspaceMember.name,
          avatarUrl: workspaceMember.avatarUrl,
        },
      });
    }
  }

  return { resolutionByRecipientKey };
};
