import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_RECEIPT_READER_SENTENCE_MAX_COUNT } from '@/ai/constants/AiChatReceiptReaderSentenceMaxCount';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { aiChatThreadReadPositionsFamilyState } from '@/ai/states/aiChatThreadReadPositionsFamilyState';
import { aiChatMessageIdsSelector } from '@/ai/states/selectors/aiChatMessageIdsSelector';
import { aiChatMessageFamilySelector } from '@/ai/states/selectors/aiChatMessageFamilySelector';
import { getAiChatMessageReaders } from '@/ai/utils/getAiChatMessageReaders';
import { getAiChatSenderLabel } from '@/ai/utils/getAiChatSenderLabel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ChatMessageReceipt } from '@/chat/components/ChatMessageReceipt';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

const StyledReceipt = styled.span`
  display: inline-flex;
`;

const StyledReaderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledReader = styled.div<{ isPending?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  opacity: ${({ isPending }) => (isPending ? 0.5 : 1)};
`;

const StyledPendingLabel = styled.div`
  margin-top: ${themeCssVariables.spacing[1]};
  opacity: 0.5;
`;

type AiChatMessageReceiptProps = {
  messageId: string;
};

export const AiChatMessageReceipt = ({
  messageId,
}: AiChatMessageReceiptProps) => {
  const { t } = useLingui();
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
  const aiChatThreadReadPositions = useAtomFamilyStateValue(
    aiChatThreadReadPositionsFamilyState,
    { threadId: aiChatDisplayedThread },
  );
  const aiChatIsSendingMessage = useAtomFamilyStateValue(
    aiChatIsSendingMessageFamilyState,
    { threadId: aiChatDisplayedThread ?? '' },
  );
  const aiChatMessageIds = useAtomStateValue(aiChatMessageIdsSelector);
  const agentChatMessage = useAtomFamilySelectorValue(
    aiChatMessageFamilySelector,
    { messageId },
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  if (
    !isDefined(aiChatThreadReadPositions) ||
    !isDefined(agentChatMessage?.metadata?.createdAt)
  ) {
    return null;
  }

  if (aiChatIsSendingMessage && aiChatMessageIds.at(-1) === messageId) {
    return <ChatMessageReceipt status="sending" />;
  }

  const { readerWorkspaceMemberIds, pendingWorkspaceMemberIds } =
    getAiChatMessageReaders({
      readPositions: aiChatThreadReadPositions,
      createdAt: agentChatMessage.metadata.createdAt,
      senderWorkspaceMemberId:
        agentChatMessage.metadata.senderWorkspaceMemberId ?? undefined,
    });

  if (!isNonEmptyArray(readerWorkspaceMemberIds)) {
    return <ChatMessageReceipt status="sent" />;
  }

  const getMember = (workspaceMemberId: string) => {
    const member = currentWorkspaceMembers.find(
      ({ id }) => id === workspaceMemberId,
    );

    return {
      id: workspaceMemberId,
      avatarUrl: member?.avatarUrl,
      name: getAiChatSenderLabel({
        sender: member,
        isCurrentWorkspaceMember:
          workspaceMemberId === currentWorkspaceMember?.id,
      }),
    };
  };

  const readers = readerWorkspaceMemberIds.map(getMember);
  const pendingMembers = pendingWorkspaceMemberIds.map(getMember);
  const readerNames = formatDisplayList(readers.map(({ name }) => name));
  const readerCount = readers.length;
  const recipientCount = readerCount + pendingMembers.length;
  const isSentence =
    !isNonEmptyArray(pendingMembers) &&
    readerCount <= AI_CHAT_RECEIPT_READER_SENTENCE_MAX_COUNT;

  return (
    <Tooltip
      content={
        isSentence ? (
          t`Read by ${readerNames}`
        ) : (
          <StyledReaderList>
            {t`Read by ${readerCount} of ${recipientCount}`}
            {readers.map(({ id, name, avatarUrl }) => (
              <StyledReader key={id}>
                <Avatar
                  name={name}
                  colorSeed={id}
                  src={getAbsoluteImageUrl(avatarUrl)}
                  size="sm"
                  shape="circle"
                />
                {name}
              </StyledReader>
            ))}
            {isNonEmptyArray(pendingMembers) && (
              <StyledPendingLabel>{t`Not yet`}</StyledPendingLabel>
            )}
            {pendingMembers.map(({ id, name, avatarUrl }) => (
              <StyledReader key={id} isPending>
                <Avatar
                  name={name}
                  colorSeed={id}
                  src={getAbsoluteImageUrl(avatarUrl)}
                  size="sm"
                  shape="circle"
                />
                {name}
              </StyledReader>
            ))}
          </StyledReaderList>
        )
      }
    >
      <StyledReceipt>
        <ChatMessageReceipt status="read" />
      </StyledReceipt>
    </Tooltip>
  );
};
