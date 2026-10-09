import { isNonEmptyString, isUndefined } from '@sniptt/guards';

import { type CallParticipantDisplayItem } from 'src/front-components/types/call-participant-display-item.type';
import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';
import { getFirstNonEmptyString } from 'src/front-components/utils/get-first-non-empty-string.util';
import { getFullName } from 'src/front-components/utils/get-full-name.util';

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

const toDisplayItem = (
  participant: CallParticipantNode,
): CallParticipantDisplayItem | undefined => {
  const isOrganizer = participant.isOrganizer === true;
  const attendeeLabel = getFirstNonEmptyString([
    participant.displayName,
    participant.handle,
  ]);

  // A matched person wins over a workspace member: it has a record page.
  const personId = participant.personId ?? participant.person?.id;

  if (isNonEmptyString(personId)) {
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

  const workspaceMemberId =
    participant.workspaceMemberId ?? participant.workspaceMember?.id;

  if (isNonEmptyString(workspaceMemberId)) {
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

  const handle = getFirstNonEmptyString([participant.handle]);

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
  showUnmatchedAttendees,
}: {
  participants: CallParticipantNode[];
  showUnmatchedAttendees: boolean;
}): BuildCallParticipantDisplayItemsResult => {
  const displayItemsByKey = new Map<string, CallParticipantDisplayItem>();
  let hiddenUnmatchedCount = 0;

  for (const participant of participants) {
    const displayItem = toDisplayItem(participant);

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
