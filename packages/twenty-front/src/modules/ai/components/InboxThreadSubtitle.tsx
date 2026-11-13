import { styled } from '@linaria/react';
import { isNonEmptyString } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxThreadReasonBadge } from '@/ai/components/InboxThreadReasonBadge';
import { useInboxThreadSubtitleContent } from '@/ai/hooks/useInboxThreadSubtitleContent';
import { useIsInboxThreadShownAsUnread } from '@/ai/hooks/useIsInboxThreadShownAsUnread';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

const StyledSubtitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  line-height: calc(
    ${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing['0.5']}
  );
  min-height: calc(
    ${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing['0.5']}
  );
  min-width: 0;
`;

const StyledPreview = styled.div`
  min-width: 0;
`;

type InboxThreadSubtitleProps = {
  thread: InboxThreadRecord;
  size?: 'sm' | 'md';
};

export const InboxThreadSubtitle = ({
  thread,
  size = 'sm',
}: InboxThreadSubtitleProps) => {
  const isUnread = useIsInboxThreadShownAsUnread(thread);
  const { isAwaitingAnswer, hasDraft, previewText } =
    useInboxThreadSubtitleContent(thread);

  return (
    <Text
      render={<StyledSubtitle />}
      size={size}
      color={isUnread ? 'secondary' : 'tertiary'}
    >
      {isAwaitingAnswer && (
        <InboxThreadReasonBadge reason="needsInput" isUnread={isUnread} />
      )}
      {isAwaitingAnswer && hasDraft && <span aria-hidden>·</span>}
      {hasDraft && <InboxThreadReasonBadge reason="draft" />}
      {(isAwaitingAnswer || hasDraft) && isNonEmptyString(previewText) && (
        <span aria-hidden>·</span>
      )}
      <Text render={<StyledPreview />} truncate>
        {previewText}
      </Text>
    </Text>
  );
};
