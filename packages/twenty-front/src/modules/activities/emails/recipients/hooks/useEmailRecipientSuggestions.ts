import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EMAIL_RECIPIENT_SUGGESTIONS_LIMIT } from '@/activities/emails/recipients/constants/EmailRecipientSuggestionsLimit';
import { useEmailComposerContextPeople } from '@/activities/emails/recipients/hooks/useEmailComposerContextPeople';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { getEmailRecipientPersonFromRecord } from '@/activities/emails/recipients/utils/getEmailRecipientPersonFromRecord';
import { getEmailRecipientSuggestionFromPerson } from '@/activities/emails/recipients/utils/getEmailRecipientSuggestionFromPerson';
import { getEmailRecipientSuggestionFromWorkspaceMember } from '@/activities/emails/recipients/utils/getEmailRecipientSuggestionFromWorkspaceMember';
import { getEmailRecipientSuggestionList } from '@/activities/emails/recipients/utils/getEmailRecipientSuggestionList';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useEmailRecipientSuggestions = ({
  searchInput,
  excludedRecipientKeys,
  contextRecord,
}: {
  searchInput: string;
  excludedRecipientKeys: string[];
  contextRecord?: EmailComposerContextRecord | null;
}): { suggestions: EmailRecipientSuggestion[] } => {
  const { t } = useLingui();

  const trimmedSearchInput = searchInput.trim();
  const isSearching = isNonEmptyString(trimmedSearchInput);

  const { contextPeople } = useEmailComposerContextPeople({ contextRecord });

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const { searchRecords } = useObjectRecordSearchRecords({
    objectNameSingulars: [
      CoreObjectNameSingular.Person,
      CoreObjectNameSingular.WorkspaceMember,
    ],
    searchInput: trimmedSearchInput,
    limit: EMAIL_RECIPIENT_SUGGESTIONS_LIMIT,
    skip: !isSearching,
  });

  const searchedPersonIds = searchRecords
    .filter(
      (searchRecord) =>
        searchRecord.objectNameSingular === CoreObjectNameSingular.Person,
    )
    .map((searchRecord) => searchRecord.recordId);

  const { records: searchedPersonRecords } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: { id: { in: searchedPersonIds } },
    recordGqlFields: { id: true, name: true, avatarUrl: true, emails: true },
    limit: EMAIL_RECIPIENT_SUGGESTIONS_LIMIT,
    skip: searchedPersonIds.length === 0,
  });

  const searchedPeople = searchedPersonRecords.map(
    getEmailRecipientPersonFromRecord,
  );

  const contextPersonIds = new Set(
    contextPeople.map((contextPerson) => contextPerson.id),
  );

  const rankedSearchRecords = [
    ...searchRecords.filter((searchRecord) =>
      contextPersonIds.has(searchRecord.recordId),
    ),
    ...searchRecords.filter(
      (searchRecord) => !contextPersonIds.has(searchRecord.recordId),
    ),
  ];

  const searchSuggestions = rankedSearchRecords.flatMap(
    (searchRecord): EmailRecipientSuggestion[] => {
      switch (searchRecord.objectNameSingular) {
        case CoreObjectNameSingular.Person: {
          const searchedPerson = searchedPeople.find(
            (person) => person.id === searchRecord.recordId,
          );

          return isDefined(searchedPerson)
            ? [
                getEmailRecipientSuggestionFromPerson({
                  person: searchedPerson,
                }),
              ]
            : [];
        }
        case CoreObjectNameSingular.WorkspaceMember: {
          const workspaceMember = currentWorkspaceMembers.find(
            (currentWorkspaceMember) =>
              currentWorkspaceMember.id === searchRecord.recordId,
          );

          return isDefined(workspaceMember)
            ? [
                getEmailRecipientSuggestionFromWorkspaceMember({
                  workspaceMember,
                  teamMemberLabel: t`Team member`,
                }),
              ]
            : [];
        }
        default:
          return [];
      }
    },
  );

  const rankedSuggestions = isSearching
    ? searchSuggestions
    : contextPeople.map((contextPerson) =>
        getEmailRecipientSuggestionFromPerson({ person: contextPerson }),
      );

  const typedEmailSuggestion = isValidEmailRecipientAddress(trimmedSearchInput)
    ? {
        suggestionId: `typed-email-${getEmailRecipientKey(trimmedSearchInput)}`,
        recipient: { address: trimmedSearchInput },
        label: trimmedSearchInput,
        secondaryText: t`Use this email`,
        avatarColorSeed: getEmailRecipientKey(trimmedSearchInput),
      }
    : undefined;

  const suggestions = getEmailRecipientSuggestionList({
    rankedSuggestions,
    typedEmailSuggestion,
    excludedRecipientKeys,
    limit: EMAIL_RECIPIENT_SUGGESTIONS_LIMIT,
  });

  return { suggestions };
};
