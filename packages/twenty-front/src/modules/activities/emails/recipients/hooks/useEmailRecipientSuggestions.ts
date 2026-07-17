import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_RECIPIENT_MEMBER_SUGGESTIONS_LIMIT } from '@/activities/emails/recipients/constants/EmailRecipientMemberSuggestionsLimit';
import { EMAIL_RECIPIENT_PEOPLE_SUGGESTIONS_LIMIT } from '@/activities/emails/recipients/constants/EmailRecipientPeopleSuggestionsLimit';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
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
  recipient: { address: string; displayName?: string };
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

const getSuggestion = ({
  suggestionId,
  fullName,
  address,
  secondaryText,
  avatarUrl,
  avatarColorSeed,
}: {
  suggestionId: string;
  fullName: string;
  address: string;
  secondaryText: string;
  avatarUrl: string | null;
  avatarColorSeed: string;
}): EmailRecipientSuggestion => ({
  suggestionId,
  recipient: {
    address,
    displayName: isNonEmptyString(fullName) ? fullName : undefined,
  },
  label: isNonEmptyString(fullName) ? fullName : address,
  secondaryText,
  avatarUrl,
  avatarColorSeed,
});

const getPersonSuggestion = (
  person: EmailRecipientPerson,
): EmailRecipientSuggestion =>
  getSuggestion({
    suggestionId: `person-${person.id}`,
    fullName: `${person.firstName} ${person.lastName}`.trim(),
    address: person.primaryEmail,
    secondaryText: person.primaryEmail,
    avatarUrl: person.avatarUrl,
    avatarColorSeed: person.id,
  });

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
    objectNameSingulars: [
      CoreObjectNameSingular.Person,
      CoreObjectNameSingular.WorkspaceMember,
    ],
    searchInput: hasSearchInput ? trimmedSearchInput : undefined,
    limit:
      EMAIL_RECIPIENT_PEOPLE_SUGGESTIONS_LIMIT +
      EMAIL_RECIPIENT_MEMBER_SUGGESTIONS_LIMIT,
  });

  const searchedPersonIds = searchRecords
    .filter(
      (searchRecord) =>
        searchRecord.objectNameSingular === CoreObjectNameSingular.Person,
    )
    .map((searchRecord) => searchRecord.recordId)
    .slice(0, EMAIL_RECIPIENT_PEOPLE_SUGGESTIONS_LIMIT);

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

  const searchedPeopleById = new Map(
    searchedPeopleRecords.map((personRecord) => [
      personRecord.id,
      getEmailRecipientPersonFromRecord(personRecord),
    ]),
  );

  const contextPersonIds = new Set(contextPeople.map((person) => person.id));

  const workspaceMembersById = new Map(
    currentWorkspaceMembers.map((workspaceMember) => [
      workspaceMember.id,
      workspaceMember,
    ]),
  );

  const contextRankedSuggestions: EmailRecipientSuggestion[] = [];
  const rankedSuggestions: EmailRecipientSuggestion[] = [];
  let memberSuggestionCount = 0;

  for (const searchRecord of searchRecords) {
    if (searchRecord.objectNameSingular === CoreObjectNameSingular.Person) {
      const person = searchedPeopleById.get(searchRecord.recordId);

      if (isDefined(person) && isSuggestablePerson(person)) {
        (contextPersonIds.has(person.id)
          ? contextRankedSuggestions
          : rankedSuggestions
        ).push(getPersonSuggestion(person));
      }
      continue;
    }

    const workspaceMember = workspaceMembersById.get(searchRecord.recordId);

    if (
      isDefined(workspaceMember) &&
      isNonEmptyString(workspaceMember.userEmail) &&
      !excludedKeySet.has(getEmailRecipientKey(workspaceMember.userEmail)) &&
      memberSuggestionCount < EMAIL_RECIPIENT_MEMBER_SUGGESTIONS_LIMIT
    ) {
      memberSuggestionCount += 1;
      rankedSuggestions.push(
        getSuggestion({
          suggestionId: `workspace-member-${workspaceMember.id}`,
          fullName:
            `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim(),
          address: workspaceMember.userEmail,
          secondaryText: `${workspaceMember.userEmail} · ${t`Team member`}`,
          avatarUrl: workspaceMember.avatarUrl ?? null,
          avatarColorSeed: workspaceMember.id,
        }),
      );
    }
  }

  const recordSuggestions = hasSearchInput
    ? [...contextRankedSuggestions, ...rankedSuggestions]
    : contextPeople.filter(isSuggestablePerson).map(getPersonSuggestion);

  const seenRecipientKeys = new Set<string>();
  const dedupedRecordSuggestions = recordSuggestions.filter((suggestion) => {
    const recipientKey = getEmailRecipientKey(suggestion.recipient.address);

    if (seenRecipientKeys.has(recipientKey)) {
      return false;
    }

    seenRecipientKeys.add(recipientKey);
    return true;
  });

  const literalKey = getEmailRecipientKey(trimmedSearchInput);
  const bufferIsAddableAddress =
    hasSearchInput &&
    isValidEmailRecipientAddress(trimmedSearchInput) &&
    !excludedKeySet.has(literalKey);

  if (!bufferIsAddableAddress) {
    return { suggestions: dedupedRecordSuggestions };
  }

  const exactMatchSuggestion = dedupedRecordSuggestions.find(
    (suggestion) =>
      getEmailRecipientKey(suggestion.recipient.address) === literalKey,
  );

  const firstSuggestion: EmailRecipientSuggestion = exactMatchSuggestion ?? {
    suggestionId: 'literal',
    recipient: { address: trimmedSearchInput },
    label: trimmedSearchInput,
    secondaryText: t`Use this email`,
    avatarUrl: null,
    avatarColorSeed: literalKey,
  };

  return {
    suggestions: [
      firstSuggestion,
      ...dedupedRecordSuggestions.filter(
        (suggestion) => suggestion !== firstSuggestion,
      ),
    ],
  };
};
