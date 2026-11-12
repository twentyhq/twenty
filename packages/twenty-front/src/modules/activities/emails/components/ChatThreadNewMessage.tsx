import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { FormFieldRow } from 'twenty-ui/components/input';
import { IconUsers } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { type ChatThreadRecipient } from '@/activities/emails/types/ChatThreadRecipient';
import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';
import { ChatRecipientChip } from '@/chat/components/ChatRecipientChip';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledBody = styled.div`
  flex: 1;
  min-height: 0;
`;

type ChatThreadNewMessageProps = {
  recipients: ChatThreadRecipient[];
  onRecipientRemove: (recipientId: string) => void;
  channelName: string;
  onSendMessage: (pendingMessage: PendingChatMessage) => Promise<unknown>;
  onMessageSent: () => Promise<unknown>;
  canAttachFiles?: boolean;
};

export const ChatThreadNewMessage = ({
  recipients,
  onRecipientRemove,
  channelName,
  onSendMessage,
  onMessageSent,
  canAttachFiles = false,
}: ChatThreadNewMessageProps) => {
  const { t } = useLingui();
  const recipientRowRef = useRef<HTMLDivElement>(null);
  const [firstRecipient] = recipients;

  return (
    <StyledContainer>
      <FormFieldRow
        ref={recipientRowRef}
        tabIndex={-1}
        aria-label={t`Recipients`}
        startIcon={<IconUsers size={themeCssVariables.icon.size.md} />}
        hasDivider
      >
        {recipients.map(({ id, name, avatarUrl }) => (
          <ChatRecipientChip
            key={id}
            label={name}
            avatar={
              <Avatar
                name={name}
                colorSeed={id}
                src={avatarUrl}
                size="sm"
                shape="circle"
              />
            }
            onRemove={() => {
              recipientRowRef.current?.focus();
              onRecipientRemove(id);
            }}
          />
        ))}
      </FormFieldRow>
      <StyledBody />
      <ChatThreadComposer
        channelName={channelName}
        recipientName={firstRecipient?.name ?? null}
        isDisconnected={false}
        isSendDisabled={!isNonEmptyArray(recipients)}
        onSendMessage={onSendMessage}
        onMessageSent={onMessageSent}
        canAttachFiles={canAttachFiles}
      />
    </StyledContainer>
  );
};
