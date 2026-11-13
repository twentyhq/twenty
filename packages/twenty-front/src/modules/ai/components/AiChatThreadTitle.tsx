import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useIsAiChatThreadShownAsUnread } from '@/ai/hooks/useIsAiChatThreadShownAsUnread';
import { useAiChatThreadDisplayLabel } from '@/ai/hooks/useAiChatThreadDisplayLabel';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

const StyledTitle = styled.div`
  flex: 1;
  line-height: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

type AiChatThreadTitleProps = {
  thread: AiChatThreadRecord;
};

export const AiChatThreadTitle = ({ thread }: AiChatThreadTitleProps) => {
  const { t } = useLingui();
  const isUnread = useIsAiChatThreadShownAsUnread(thread);
  const displayLabel = useAiChatThreadDisplayLabel({
    thread,
    fallbackLabel: t`Untitled`,
  });

  return (
    <Text
      render={<StyledTitle />}
      size="md"
      weight={isUnread ? 'semibold' : 'regular'}
      color="primary"
      truncate
    >
      {displayLabel}
      {isUnread && <VisuallyHidden>{t`, unread`}</VisuallyHidden>}
    </Text>
  );
};
