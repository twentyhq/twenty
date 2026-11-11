import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  IconCheck,
  IconChecks,
  IconClock,
  type IconComponent,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type ChatMessageReceiptStatus } from '@/chat/types/ChatMessageReceiptStatus';

const RECEIPT_ICONS: Record<ChatMessageReceiptStatus, IconComponent> = {
  sending: IconClock,
  sent: IconCheck,
  read: IconChecks,
};

const StyledReceipt = styled.span<{ isRead: boolean }>`
  color: ${({ isRead }) =>
    isRead
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

type ChatMessageReceiptProps = {
  status: ChatMessageReceiptStatus;
};

export const ChatMessageReceipt = ({ status }: ChatMessageReceiptProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const Icon = RECEIPT_ICONS[status];
  const labels: Record<ChatMessageReceiptStatus, string> = {
    sending: t`Sending`,
    sent: t`Sent`,
    read: t`Read`,
  };

  return (
    <StyledReceipt
      role="img"
      aria-label={labels[status]}
      isRead={status === 'read'}
    >
      <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
    </StyledReceipt>
  );
};
