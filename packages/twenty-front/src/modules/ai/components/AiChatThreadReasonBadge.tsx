import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  IconAlertCircle,
  IconAt,
  IconCheck,
  IconHandClick,
  IconPencil,
  IconUsers,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type AiChatThreadReason } from '@/ai/types/AiChatThreadReason';

const StyledReason = styled.span<{
  $isHighlighted: boolean;
  $isUnread: boolean;
}>`
  align-items: center;
  color: ${({ $isHighlighted, $isUnread }) => {
    if ($isHighlighted) {
      return themeCssVariables.accent.primary;
    }

    if ($isUnread) {
      return themeCssVariables.font.color.primary;
    }

    return themeCssVariables.font.color.tertiary;
  }};
  display: inline-flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type AiChatThreadReasonBadgeProps = {
  reason: AiChatThreadReason;
  isUnread?: boolean;
};

export const AiChatThreadReasonBadge = ({
  reason,
  isUnread = false,
}: AiChatThreadReasonBadgeProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const reasons = {
    needsInput: { Icon: IconHandClick, label: t`Needs input` },
    mentioned: { Icon: IconAt, label: t`Mentioned you` },
    assigned: { Icon: IconUsers, label: t`Assigned to you` },
    finished: { Icon: IconCheck, label: t`Finished` },
    failed: { Icon: IconAlertCircle, label: t`Failed` },
    cancelled: { Icon: IconX, label: t`Cancelled` },
    draft: { Icon: IconPencil, label: t`Draft` },
  };
  const { Icon, label } = reasons[reason];
  const isHighlighted =
    isUnread && ['needsInput', 'mentioned', 'assigned'].includes(reason);

  return (
    <StyledReason
      $isHighlighted={isHighlighted}
      $isUnread={isUnread && reason !== 'draft'}
    >
      <Icon size={theme.icon.size.sm} />
      {label}
    </StyledReason>
  );
};
