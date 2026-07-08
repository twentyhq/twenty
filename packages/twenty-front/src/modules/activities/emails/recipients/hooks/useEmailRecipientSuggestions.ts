import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_RECIPIENT_MEMBER_SUGGESTIONS_LIMIT } from '@/activities/emails/recipients/constants/EmailRecipientMemberSuggestionsLimit';
import { EMAIL_RECIPIENT_PEOPLE_SUGGESTIONS_LIMIT } from '@/activities/emails/recipients/constants/EmailRecipientPeopleSuggestionsLimit';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientPerson } from '@/activities/emails/recipients/types/EmailRecipientPerson';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { getEmailRecipientPersonFromRecord } from '@/activities/emails/recipients/utils/getEmailRecipientPersonFromRecord';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export type EmailRecipientSuggestion = {
  suggestionId: string;
  recipient: EmailRecipient;
  label: string;
  secondaryText: string;
  avatarUrl: string | null;
  avatarColorSeed: string;
};

type UseEmailRecipientSuggestionsArgs = {
  searchInput: string;
  excludedRecipientKeys: string[];
  contextRecord?: EmailComposerContextRecord | null;
};

const getPersonSuggestion = (
  person: EmailRecipientPerson,
): EmailRecipientSuggestion => {
  const fullName = `${person.firstName} ${person.lastName}`.trim();

  return {
    suggestionId: `person-${person.id}`,
    recipient: {
      address: person.primaryEmail,
      displayName: isNonEmptyString(fullName) ? fullName : undefined,
    },
    label: isNonEmptyString(fullName) ? fullName : person.primaryEmail,
    secondaryText: person.primaryEmail,
    avatarUrl: person.avatarUrl,
    avatarColorSeed: person.id,
  };
};

export const useEmailRecipientSuggestions = ({
  searchInput,
  excludedRecipientKeys,
  contextRecord,
}: UseEmailRecipientSuggestionsArgs) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const trimmedSearchInput = searchInput.trim();
  const hasSearchInput = trimmedSearchInput.length > 0;

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
    limit: EMAIL_RECIPIENT_PEOPLE_SUGGESTIONS_LIMIT,
    skip: !isDefined(contextCompanyId),
  });

  const { searchRecords } = useObjectRecordSearchRecords({
    objectNameSingulars: [CoreObjectNameSingular.Person],
    searchInput: hasSearchInput ? trimmedSearchInput : undefined,
    limit: EMAIL_RECIPIENT_PEOPLE_SUGGESTIONS_LIMIT,
  });

  const searchedPersonIds = searchRecords.map(
    (searchRecord) => searchRecord.recordId,
  );

  const { records: searchedPeopleRecords } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: { id: { in: searchedPersonIds } },
    recordGqlFields: { id: true, name: true, avatarUrl: true, emails: true },
    limit: EMAIL_RECIPIENT_PEOPLE_SUGGESTIONS_LIMIT,
    skip: !hasSearchInput || searchedPersonIds.length === 0,
  });

  const excludedKeySet = new Set(excludedRecipientKeys);

  const isSuggestablePerson = (person: EmailRecipientPerson) =>
    isNonEmptyString(person.primaryEmail) &&
    !excludedKeySet.has(getEmailRecipientKey(person.primaryEmail));

  const contextPeople = contextPeopleRecords.map(
    getEmailRecipientPersonFromRecord,
  );

  let peopleSuggestions: EmailRecipientSuggestion[];

  if (hasSearchInput) {
    const searchedPeopleById = new Map(
      searchedPeopleRecords.map((personRecord) => [
        personRecord.id,
        getEmailRecipientPersonFromRecord(personRecord),
      ]),
    );
    const orderedSearchedPeople = searchedPersonIds
      .map((personId) => searchedPeopleById.get(personId))
      .filter(isDefined);

    const contextPersonIds = new Set(contextPeople.map((person) => person.id));

    peopleSuggestions = [
      ...orderedSearchedPeople.filter((person) =>
        contextPersonIds.has(person.id),
      ),
      ...orderedSearchedPeople.filter(
        (person) => !contextPersonIds.has(person.id),
      ),
    ]
      .filter(isSuggestablePerson)
      .map(getPersonSuggestion);
  } else {
    peopleSuggestions = contextPeople
      .filter(isSuggestablePerson)
      .map(getPersonSuggestion);
  }

  const lowercasedSearchInput = trimmedSearchInput.toLowerCase();

  const memberSuggestions: EmailRecipientSuggestion[] = hasSearchInput
    ? currentWorkspaceMembers
        .filter((workspaceMember) => {
          const memberFullName =
            `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

          return (
            isNonEmptyString(workspaceMember.userEmail) &&
            !excludedKeySet.has(
              getEmailRecipientKey(workspaceMember.userEmail),
            ) &&
            `${memberFullName} ${workspaceMember.userEmail}`
              .toLowerCase()
              .includes(lowercasedSearchInput)
          );
        })
        .slice(0, EMAIL_RECIPIENT_MEMBER_SUGGESTIONS_LIMIT)
        .map((workspaceMember) => {
          const memberFullName =
            `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

          return {
            suggestionId: `workspace-member-${workspaceMember.id}`,
            recipient: {
              address: workspaceMember.userEmail,
              displayName: isNonEmptyString(memberFullName)
                ? memberFullName
                : undefined,
            },
            label: isNonEmptyString(memberFullName)
              ? memberFullName
              : workspaceMember.userEmail,
            secondaryText: `${workspaceMember.userEmail} · ${t`Team member`}`,
            avatarUrl: workspaceMember.avatarUrl ?? null,
            avatarColorSeed: workspaceMember.id,
          };
        })
    : [];

  const literalKey = getEmailRecipientKey(trimmedSearchInput);
  const shouldSuggestLiteral =
    hasSearchInput &&
    isValidEmailRecipientAddress(trimmedSearchInput) &&
    !excludedKeySet.has(literalKey) &&
    ![...peopleSuggestions, ...memberSuggestions].some(
      (suggestion) =>
        getEmailRecipientKey(suggestion.recipient.address) === literalKey,
    );

  const literalSuggestions: EmailRecipientSuggestion[] = shouldSuggestLiteral
    ? [
        {
          suggestionId: 'literal',
          recipient: { address: trimmedSearchInput },
          label: trimmedSearchInput,
          secondaryText: t`Use this email`,
          avatarUrl: null,
          avatarColorSeed: literalKey,
        },
      ]
    : [];

  const suggestions = [
    ...literalSuggestions,
    ...peopleSuggestions,
    ...memberSuggestions,
  ];

  return { suggestions };
};
