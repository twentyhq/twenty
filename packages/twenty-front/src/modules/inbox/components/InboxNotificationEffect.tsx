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
import { INBOX_NOTIFICATION_LEVEL } from '@/inbox/constants/InboxNotificationLevel';
import { useShowInboxNotification } from '@/inbox/hooks/useShowInboxNotification';
import { inboxNotificationLevelState } from '@/inbox/states/inboxNotificationLevelState';
import { inboxNotifiedLastActivityAtByThreadIdState } from '@/inbox/states/inboxNotifiedLastActivityAtByThreadIdState';
import { answerFocusedTabRequestsFromOtherTabs } from '@/inbox/utils/answerFocusedTabRequestsFromOtherTabs';
import { isAnotherTabFocused } from '@/inbox/utils/isAnotherTabFocused';
import { isDocumentFocused } from '@/inbox/utils/isDocumentFocused';
import { isInboxNotificationDue } from '@/inbox/utils/isInboxNotificationDue';
import { isWithinInboxNotificationActivityWindow } from '@/inbox/utils/isWithinInboxNotificationActivityWindow';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { getBrowserNotificationPermission } from '~/utils/getBrowserNotificationPermission';

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
  const inboxNotificationLevel = useAtomStateValue(inboxNotificationLevelState);
  const { showInboxNotification } = useShowInboxNotification();

  const isEnabled =
    isAiChatInboxEnabled &&
    hasAiPermission &&
    inboxNotificationLevel !== INBOX_NOTIFICATION_LEVEL.NONE &&
    getBrowserNotificationPermission() !== 'unsupported';

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

      if (
        isDocumentFocused() ||
        getBrowserNotificationPermission() !== 'granted' ||
        !isDefined(currentWorkspaceMemberId) ||
        !isDefined(lastActivityAt) ||
        store.get(inboxNotifiedLastActivityAtByThreadIdState.atom)[
          thread.id
        ] === lastActivityAt ||
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
        inboxNotifiedLastActivityAtByThreadIdState.atom,
        (notified) => ({
          ...notified,
          [thread.id]: lastActivityAt,
        }),
      );

      if ((await isAnotherTabFocused()) || isDocumentFocused()) {
        return;
      }

      showInboxNotification(thread);
    },
    [inboxNotificationLevel, showInboxNotification, store],
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

        void showInboxNotificationWhenDue({
          thread: {
            ...store.get(
              aiChatThreadRecordFamilySelector.selectorFamily(recordId),
            ),
            ...updatedRecord,
            ...Object.assign({}, ...updatedFields),
            id: recordId,
          },
          participant:
            store.get(aiChatThreadParticipantsState.atom)?.[recordId] ??
            store.get(aiChatThreadStreamedParticipantsState.atom)[recordId],
        });
      }
    },
    [showInboxNotificationWhenDue, store],
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
      const thread = store.get(
        aiChatThreadRecordFamilySelector.selectorFamily(participant.threadId),
      );

      if (
        !isDefined(thread?.lastActivityAt) ||
        !isWithinInboxNotificationActivityWindow({
          timestamp: participant.updatedAt,
          lastActivityAt: thread.lastActivityAt,
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
