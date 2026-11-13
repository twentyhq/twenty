import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { INBOX_THREAD_REASONS } from '@/ai/constants/AiChatThreadReasons';
import { type InboxThreadReason } from '@/ai/types/AiChatThreadReason';

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

type InboxThreadReasonBadgeProps = {
  reason: InboxThreadReason;
  isUnread?: boolean;
};

export const InboxThreadReasonBadge = ({
  reason,
  isUnread = false,
}: InboxThreadReasonBadgeProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { Icon, label } = INBOX_THREAD_REASONS[reason];
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
