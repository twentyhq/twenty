import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_REASONS } from '@/ai/constants/AiChatThreadReasons';
import { type AiChatThreadReason } from '@/ai/types/AiChatThreadReason';

const StyledReason = styled.span<{
  $isHighlighted: boolean;
  $isUnread: boolean;
}>`
  align-items: center;
  color: ${({ $isHighlighted, $isUnread }) => {
    if ($isHighlighted) {
      return themeCssVariables.color.blue;
    }

    if ($isUnread) {
      return themeCssVariables.font.color.primary;
    }

    return themeCssVariables.font.color.tertiary;
  }};
  display: inline-flex;
  flex-shrink: 0;
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
  const { Icon, label } = AI_CHAT_THREAD_REASONS[reason];
  const isHighlighted =
    isUnread && ['needsInput', 'mentioned', 'assigned'].includes(reason);

  return (
    <Text
      render={
        <StyledReason
          $isHighlighted={isHighlighted}
          $isUnread={isUnread && reason !== 'draft'}
        />
      }
      size="sm"
    >
      <Icon size={theme.icon.size.sm} />
      {t(label)}
    </Text>
  );
};
