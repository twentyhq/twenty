import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';
import { IconUserPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { useAiChatThreadMembers } from '@/ai-chat/threads/hooks/useAiChatThreadMembers';
import { aiChatThreadPermissionsFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadPermissionsFamilySelector';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useOpenAiChatParticipantsInSidePanel } from '@/side-panel/hooks/useOpenAiChatParticipantsInSidePanel';
import { SidePanelAiChatParticipantsAssigneeItem } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAiChatParticipantsAssigneeItem';
import { SidePanelAiChatParticipantsMemberAvatar } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAiChatParticipantsMemberAvatar';
import { SidePanelAiChatParticipantsPageLayout } from '@/side-panel/pages/ai-chat-participants/components/SidePanelAiChatParticipantsPageLayout';
import { aiChatParticipantsThreadIdComponentState } from '@/side-panel/states/aiChatParticipantsThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const ASSIGNEE_ITEM_ID = 'assignee';

export const SidePanelAiChatParticipantsPage = () => {
  const { t } = useLingui();
  const aiChatParticipantsThreadId = useAtomComponentStateValue(
    aiChatParticipantsThreadIdComponentState,
  );
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    aiChatParticipantsThreadId ?? '',
  );
  const threadPermissions = useAtomFamilySelectorValue(
    aiChatThreadPermissionsFamilySelector,
    aiChatParticipantsThreadId ?? '',
  );
  const threadMembers = useAiChatThreadMembers(thread);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { openAiChatParticipantsInSidePanel } =
    useOpenAiChatParticipantsInSidePanel();

  if (!isDefined(aiChatParticipantsThreadId)) {
    return null;
  }

  const canEdit = threadPermissions?.canUpdate ?? false;
  const assignee = threadMembers.find(({ id }) => id === thread?.assigneeId);
  const participants = threadMembers.filter(
    ({ id }) => id !== thread?.assigneeId,
  );
  const getDescription = (workspaceMemberId: string) =>
    workspaceMemberId === currentWorkspaceMember?.id ? t`You` : undefined;

  return (
    <SidePanelAiChatParticipantsPageLayout
      footerActions={
        canEdit
          ? [
              <Button
                key="add-participant"
                size="sm"
                variant="solid"
                color="accent"
                startIcon={<IconUserPlus />}
                onClick={() =>
                  openAiChatParticipantsInSidePanel({
                    threadId: aiChatParticipantsThreadId,
                    page: SidePanelPages.AddAiChatParticipants,
                  })
                }
              >{t`Add participants`}</Button>,
            ]
          : undefined
      }
    >
      <SidePanelList selectableItemIds={canEdit ? [ASSIGNEE_ITEM_ID] : []}>
        <SidePanelGroup heading={t`Assignee`}>
          <SidePanelAiChatParticipantsAssigneeItem
            itemId={ASSIGNEE_ITEM_ID}
            threadId={aiChatParticipantsThreadId}
            assignee={assignee}
            description={
              isDefined(assignee) ? getDescription(assignee.id) : undefined
            }
            disabled={!canEdit}
          />
        </SidePanelGroup>
        <SidePanelGroup heading={t`Participants`}>
          {participants.map((workspaceMember) => (
            <CommandMenuItem
              key={workspaceMember.id}
              id={`participant-${workspaceMember.id}`}
              label={getWorkspaceMemberNameOrEmail(workspaceMember)}
              description={getDescription(workspaceMember.id)}
              LeftComponent={
                <SidePanelAiChatParticipantsMemberAvatar
                  workspaceMember={workspaceMember}
                />
              }
            />
          ))}
        </SidePanelGroup>
      </SidePanelList>
    </SidePanelAiChatParticipantsPageLayout>
  );
};
