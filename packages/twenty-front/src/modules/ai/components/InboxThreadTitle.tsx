import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useIsInboxThreadShownAsUnread } from '@/ai/hooks/useIsInboxThreadShownAsUnread';
import { useInboxThreadDisplayLabel } from '@/ai/hooks/useInboxThreadDisplayLabel';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

const StyledTitle = styled.div`
  flex: 1;
  line-height: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

type InboxThreadTitleProps = {
  thread: InboxThreadRecord;
};

export const InboxThreadTitle = ({ thread }: InboxThreadTitleProps) => {
  const { t } = useLingui();
  const isUnread = useIsInboxThreadShownAsUnread(thread);
  const displayLabel = useInboxThreadDisplayLabel({
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
