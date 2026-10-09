import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type CallParticipantDisplayItem } from 'src/front-components/types/call-participant-display-item.type';
import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';
import { getFirstNonEmptyString } from 'src/front-components/utils/get-first-non-empty-string.util';
import { getFullName } from 'src/front-components/utils/get-full-name.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

const UNNAMED_PARTICIPANT_LABEL = 'Unnamed participant';

const DISPLAY_ITEM_KIND_ORDER: Record<
  CallParticipantDisplayItem['kind'],
  number
> = {
  person: 0,
  workspaceMember: 1,
  unmatched: 2,
};

type BuildCallParticipantDisplayItemsResult = {
  items: CallParticipantDisplayItem[];
  hiddenUnmatchedCount: number;
};

// With relations loaded, a null relation next to its id means the record is
// deleted or unreadable, so the id must not be trusted. Without them (the
// fallback query), the id is all there is.
const getMatchedRecordId = ({
  recordId,
  relatedRecord,
  areRelationsLoaded,
}: {
  recordId: string | null | undefined;
  relatedRecord: { id: string } | null | undefined;
  areRelationsLoaded: boolean;
}): string | undefined => {
  if (areRelationsLoaded) {
    return isDefined(relatedRecord) ? relatedRecord.id : undefined;
  }

  return isNonEmptyString(recordId) ? recordId : undefined;
};

const toDisplayItem = (
  participant: CallParticipantNode,
  areRelationsLoaded: boolean,
): CallParticipantDisplayItem | undefined => {
  const isOrganizer = participant.isOrganizer === true;
  const handle = getFirstNonEmptyString([
    stripRestrictedFieldValue(participant.handle ?? undefined),
  ]);
  const attendeeLabel =
    getFirstNonEmptyString([
      stripRestrictedFieldValue(participant.displayName ?? undefined),
    ]) ?? handle;

  // A matched person wins over a workspace member: it has a record page.
  const personId = getMatchedRecordId({
    recordId: participant.personId,
    relatedRecord: participant.person,
    areRelationsLoaded,
  });

  if (!isUndefined(personId)) {
    return {
      kind: 'person',
      key: `person:${personId}`,
      personId,
      label:
        getFullName(participant.person?.name) ??
        attendeeLabel ??
        UNNAMED_PARTICIPANT_LABEL,
      avatarUrl: getFirstNonEmptyString([
        participant.person?.avatarFile?.[0]?.url,
        participant.person?.avatarUrl,
      ]),
      isOrganizer,
    };
  }

  const workspaceMemberId = getMatchedRecordId({
    recordId: participant.workspaceMemberId,
    relatedRecord: participant.workspaceMember,
    areRelationsLoaded,
  });

  if (!isUndefined(workspaceMemberId)) {
    return {
      kind: 'workspaceMember',
      key: `workspaceMember:${workspaceMemberId}`,
      workspaceMemberId,
      label:
        getFullName(participant.workspaceMember?.name) ??
        attendeeLabel ??
        UNNAMED_PARTICIPANT_LABEL,
      avatarUrl: getFirstNonEmptyString([
        participant.workspaceMember?.avatarUrl,
      ]),
      isOrganizer,
    };
  }

  if (!isNonEmptyString(attendeeLabel)) {
    return undefined;
  }

  return {
    kind: 'unmatched',
    key: isNonEmptyString(handle)
      ? `handle:${handle.toLowerCase()}`
      : `participant:${participant.id}`,
    label: attendeeLabel,
    isOrganizer,
  };
};

const compareDisplayItems = (
  firstItem: CallParticipantDisplayItem,
  secondItem: CallParticipantDisplayItem,
): number => {
  if (firstItem.isOrganizer !== secondItem.isOrganizer) {
    return firstItem.isOrganizer ? -1 : 1;
  }

  const kindOrderDifference =
    DISPLAY_ITEM_KIND_ORDER[firstItem.kind] -
    DISPLAY_ITEM_KIND_ORDER[secondItem.kind];

  if (kindOrderDifference !== 0) {
    return kindOrderDifference;
  }

  return firstItem.label.localeCompare(secondItem.label);
};

export const buildCallParticipantDisplayItems = ({
  participants,
  areRelationsLoaded,
  showUnmatchedAttendees,
}: {
  participants: CallParticipantNode[];
  areRelationsLoaded: boolean;
  showUnmatchedAttendees: boolean;
}): BuildCallParticipantDisplayItemsResult => {
  const displayItemsByKey = new Map<string, CallParticipantDisplayItem>();
  let hiddenUnmatchedCount = 0;

  for (const participant of participants) {
    const displayItem = toDisplayItem(participant, areRelationsLoaded);

    if (isUndefined(displayItem)) {
      continue;
    }

    if (displayItem.kind === 'unmatched' && !showUnmatchedAttendees) {
      hiddenUnmatchedCount += 1;
      continue;
    }

    const existingDisplayItem = displayItemsByKey.get(displayItem.key);

    // The same person can attend through several handles; keep one chip.
    displayItemsByKey.set(
      displayItem.key,
      isUndefined(existingDisplayItem)
        ? displayItem
        : {
            ...existingDisplayItem,
            isOrganizer:
              existingDisplayItem.isOrganizer || displayItem.isOrganizer,
          },
    );
  }

  return {
    items: [...displayItemsByKey.values()].sort(compareDisplayItems),
    hiddenUnmatchedCount,
  };
};
