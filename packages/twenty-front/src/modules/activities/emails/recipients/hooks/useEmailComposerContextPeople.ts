import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_RECIPIENT_SUGGESTIONS_LIMIT } from '@/activities/emails/recipients/constants/EmailRecipientSuggestionsLimit';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { getEmailRecipientPersonFromRecord } from '@/activities/emails/recipients/utils/getEmailRecipientPersonFromRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

// People from the company the composer was opened from: the company record
// itself, or the company behind a person or opportunity record
export const useEmailComposerContextPeople = ({
  contextRecord,
}: {
  contextRecord?: EmailComposerContextRecord | null;
}) => {
  const isCompanyContext =
    contextRecord?.objectNameSingular === CoreObjectNameSingular.Company;
  const isPersonContext =
    contextRecord?.objectNameSingular === CoreObjectNameSingular.Person;
  const isOpportunityContext =
    contextRecord?.objectNameSingular === CoreObjectNameSingular.Opportunity;

  const { record: contextPerson } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
    objectRecordId: contextRecord?.recordId ?? '',
    recordGqlFields: { id: true, companyId: true },
    skip: !isPersonContext,
  });

  const { record: contextOpportunity } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
    objectRecordId: contextRecord?.recordId ?? '',
    recordGqlFields: { id: true, companyId: true },
    skip: !isOpportunityContext,
  });

  const contextCompanyId = isCompanyContext
    ? (contextRecord?.recordId ?? null)
    : (contextPerson?.companyId ?? contextOpportunity?.companyId ?? null);

  const { records: contextPeopleRecords } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: { companyId: { eq: contextCompanyId ?? '' } },
    recordGqlFields: { id: true, name: true, avatarUrl: true, emails: true },
    limit: EMAIL_RECIPIENT_SUGGESTIONS_LIMIT,
    skip: !isDefined(contextCompanyId),
  });

  return {
    contextPeople: contextPeopleRecords.map(getEmailRecipientPersonFromRecord),
  };
};
