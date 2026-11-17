import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { type AgentChatInboxState } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { aiChatThreadStreamedParticipantsState } from '@/ai/states/aiChatThreadStreamedParticipantsState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getAiChatThreadParticipantFromRecord } from '@/ai/utils/getAiChatThreadParticipantFromRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useShowInboxNotification } from '@/inbox/hooks/useShowInboxNotification';
import { inboxNotificationActivityByThreadIdState } from '@/inbox/states/inboxNotificationActivityByThreadIdState';
import {
  answerFocusedTabRequestsFromOtherTabs,
  isAnotherTabFocused,
} from '@/inbox/utils/inboxNotificationTabChannel';
import { isBrowserNotificationAllowed } from '@/inbox/utils/isBrowserNotificationAllowed';
import { isDocumentFocused } from '@/inbox/utils/isDocumentFocused';
import { isInboxNotificationDue } from '@/inbox/utils/isInboxNotificationDue';
import { isParticipantChangeFromInboxActivity } from '@/inbox/utils/isParticipantChangeFromInboxActivity';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useInboxNotificationPreferences } from '@/settings/experience/hooks/useInboxNotificationPreferences';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  InboxNotificationLevel,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isPageNotificationSupported } from '~/utils/isPageNotificationSupported';

export const InboxNotificationEffect = () => {
  const store = useStore();
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const participantObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThreadParticipant,
      objectNameType: 'singular',
    },
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { inboxNotificationLevel } = useInboxNotificationPreferences();
  const { showInboxNotification } = useShowInboxNotification();

  const isEnabled =
    isAiChatInboxEnabled &&
    hasAiPermission &&
    inboxNotificationLevel !== InboxNotificationLevel.NONE &&
    isPageNotificationSupported();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    return answerFocusedTabRequestsFromOtherTabs();
  }, [isEnabled]);

  const showInboxNotificationWhenDue = useCallback(
    async ({
      thread,
      participant,
    }: {
      thread: AiChatThreadRecord;
      participant: AgentChatInboxState | undefined;
    }) => {
      const currentWorkspaceMemberId = store.get(
        currentWorkspaceMemberState.atom,
      )?.id;
      const { lastActivityAt } = thread;
      const activity = store.get(inboxNotificationActivityByThreadIdState.atom)[
        thread.id
      ];
      if (
        isDocumentFocused() ||
        !isBrowserNotificationAllowed() ||
        !isDefined(currentWorkspaceMemberId) ||
        !isDefined(lastActivityAt) ||
        (activity?.isNotified === true &&
          activity.lastActivityAt === lastActivityAt) ||
        !isInboxNotificationDue({
          thread,
          participant,
          currentWorkspaceMemberId,
          inboxNotificationLevel,
        })
      ) {
        return;
      }

      store.set(
        inboxNotificationActivityByThreadIdState.atom,
        (activities) => ({
          ...activities,
          [thread.id]: { lastActivityAt, isNotified: true },
        }),
      );

      if ((await isAnotherTabFocused()) || isDocumentFocused()) {
        return;
      }

      showInboxNotification(thread);
    },
    [inboxNotificationLevel, showInboxNotification, store],
  );

  const getStoredParticipant = useCallback(
    (threadId: string) =>
      store.get(aiChatThreadParticipantsState.atom)?.[threadId] ??
      store.get(aiChatThreadStreamedParticipantsState.atom)[threadId],
    [store],
  );

  const handleThreadOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      if (operation.type !== 'update-one' && operation.type !== 'update-many') {
        return;
      }

      const updateInputs =
        operation.type === 'update-one'
          ? [operation.result.updateInput]
          : operation.result.updateInputs;

      for (const { recordId, updatedFields, updatedRecord } of updateInputs) {
        if (!updatedFields.some((fields) => 'lastActivityAt' in fields)) {
          continue;
        }

        const thread = {
          ...store.get(
            aiChatThreadRecordFamilySelector.selectorFamily(recordId),
          ),
          ...updatedRecord,
          ...Object.assign({}, ...updatedFields),
          id: recordId,
        };

        store.set(
          inboxNotificationActivityByThreadIdState.atom,
          (activities) =>
            activities[recordId]?.lastActivityAt === thread.lastActivityAt
              ? activities
              : {
                  ...activities,
                  [recordId]: {
                    lastActivityAt: thread.lastActivityAt,
                    isNotified: false,
                  },
                },
        );

        void showInboxNotificationWhenDue({
          thread,
          participant: getStoredParticipant(recordId),
        });
      }
    },
    [getStoredParticipant, showInboxNotificationWhenDue, store],
  );

  const handleParticipantOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      if (operation.type !== 'create-one' && operation.type !== 'update-one') {
        return;
      }

      const record =
        operation.type === 'create-one'
          ? operation.createdRecord
          : operation.result.updateInput.updatedRecord;

      if (!isDefined(record)) {
        return;
      }

      const participant = getAiChatThreadParticipantFromRecord(record);
      const activity = store.get(inboxNotificationActivityByThreadIdState.atom)[
        participant.threadId
      ];
      const thread = store.get(
        aiChatThreadRecordFamilySelector.selectorFamily(participant.threadId),
      );

      if (
        !isDefined(activity) ||
        !isDefined(thread) ||
        !isParticipantChangeFromInboxActivity({
          participantUpdatedAt: participant.updatedAt,
          lastActivityAt: activity.lastActivityAt,
        })
      ) {
        return;
      }

      void showInboxNotificationWhenDue({ thread, participant });
    },
    [showInboxNotificationWhenDue, store],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleThreadOperation,
    objectMetadataItemId: chatObjectMetadataItem?.id,
    enabled: isEnabled && isDefined(chatObjectMetadataItem),
  });

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleParticipantOperation,
    objectMetadataItemId: participantObjectMetadataItem?.id,
    enabled: isEnabled && isDefined(participantObjectMetadataItem),
  });

  return null;
};
