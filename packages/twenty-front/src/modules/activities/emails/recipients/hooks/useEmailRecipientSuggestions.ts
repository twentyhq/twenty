import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_RECIPIENT_SUGGESTIONS_LIMIT } from '@/activities/emails/recipients/constants/EmailRecipientSuggestionsLimit';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientPerson } from '@/activities/emails/recipients/types/EmailRecipientPerson';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { getEmailRecipientPersonFromRecord } from '@/activities/emails/recipients/utils/getEmailRecipientPersonFromRecord';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
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

const getPersonSuggestion = (
  person: EmailRecipientPerson,
): EmailRecipientSuggestion => {
  const fullName = getDisplayNameFromParticipant({
    participant: { person, displayName: '', handle: '' },
    shouldUseFullName: true,
  }).trim();

  return {
    suggestionId: `person-${person.id}`,
    recipient: {
      address: person.emails.primaryEmail,
      displayName: isNonEmptyString(fullName) ? fullName : undefined,
    },
    label: isNonEmptyString(fullName) ? fullName : person.emails.primaryEmail,
    secondaryText: person.emails.primaryEmail,
    avatarUrl: person.avatarUrl ?? null,
    avatarColorSeed: person.id,
  };
};

const getWorkspaceMemberSuggestion = (
  workspaceMember: PartialWorkspaceMember,
): EmailRecipientSuggestion => {
  const fullName = getDisplayNameFromParticipant({
    participant: { workspaceMember, displayName: '', handle: '' },
    shouldUseFullName: true,
  }).trim();

  return {
    suggestionId: `workspace-member-${workspaceMember.id}`,
    recipient: {
      address: workspaceMember.userEmail,
      displayName: isNonEmptyString(fullName) ? fullName : undefined,
    },
    label: isNonEmptyString(fullName) ? fullName : workspaceMember.userEmail,
    secondaryText: `${workspaceMember.userEmail} · ${t`Team member`}`,
    avatarUrl: workspaceMember.avatarUrl ?? null,
    avatarColorSeed: workspaceMember.id,
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
    limit: EMAIL_RECIPIENT_SUGGESTIONS_LIMIT,
    skip: !isDefined(contextCompanyId),
  });

  const { searchRecords } = useObjectRecordSearchRecords({
    objectNameSingulars: [
      CoreObjectNameSingular.Person,
      CoreObjectNameSingular.WorkspaceMember,
    ],
    searchInput: hasSearchInput ? trimmedSearchInput : undefined,
    limit: EMAIL_RECIPIENT_SUGGESTIONS_LIMIT,
  });

  const searchedPersonIds = searchRecords
    .filter(
      (searchRecord) =>
        searchRecord.objectNameSingular === CoreObjectNameSingular.Person,
    )
    .map((searchRecord) => searchRecord.recordId);

  const { records: searchedPeopleRecords } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: { id: { in: searchedPersonIds } },
    recordGqlFields: { id: true, name: true, avatarUrl: true, emails: true },
    limit: EMAIL_RECIPIENT_SUGGESTIONS_LIMIT,
    skip: !hasSearchInput || searchedPersonIds.length === 0,
  });

  const excludedKeySet = new Set(excludedRecipientKeys);

  const isSuggestableAddress = (address: string) =>
    isNonEmptyString(address) &&
    !excludedKeySet.has(getEmailRecipientKey(address));

  const searchedPeopleById = new Map(
    searchedPeopleRecords.map((personRecord) => [
      personRecord.id,
      getEmailRecipientPersonFromRecord(personRecord),
    ]),
  );
  const workspaceMembersById = new Map(
    currentWorkspaceMembers.map((workspaceMember) => [
      workspaceMember.id,
      workspaceMember,
    ]),
  );

  // Search hits stay in server rank order; each is enriched from the person
  // hydration query or the cached workspace members
  const rankedSearchSuggestions = searchRecords
    .map((searchRecord) => {
      if (searchRecord.objectNameSingular === CoreObjectNameSingular.Person) {
        const person = searchedPeopleById.get(searchRecord.recordId);

        return isDefined(person) &&
          isSuggestableAddress(person.emails.primaryEmail)
          ? getPersonSuggestion(person)
          : undefined;
      }

      const workspaceMember = workspaceMembersById.get(searchRecord.recordId);

      return isDefined(workspaceMember) &&
        isSuggestableAddress(workspaceMember.userEmail)
        ? getWorkspaceMemberSuggestion(workspaceMember)
        : undefined;
    })
    .filter(isDefined);

  const contextPeople = contextPeopleRecords.map(
    getEmailRecipientPersonFromRecord,
  );
  const contextPersonSuggestionIds = new Set(
    contextPeople.map((person) => `person-${person.id}`),
  );

  const orderedSuggestions = hasSearchInput
    ? [
        ...rankedSearchSuggestions.filter((suggestion) =>
          contextPersonSuggestionIds.has(suggestion.suggestionId),
        ),
        ...rankedSearchSuggestions.filter(
          (suggestion) =>
            !contextPersonSuggestionIds.has(suggestion.suggestionId),
        ),
      ]
    : contextPeople
        .filter((person) => isSuggestableAddress(person.emails.primaryEmail))
        .map(getPersonSuggestion);

  const seenRecipientKeys = new Set<string>();
  const dedupedRecordSuggestions = orderedSuggestions.filter((suggestion) => {
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
