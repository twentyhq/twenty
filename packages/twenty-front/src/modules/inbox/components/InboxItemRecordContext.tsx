import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemSubjectChip } from '@/inbox/components/InboxItemSubjectChip';
import { InboxPlanEntityGraph } from '@/inbox/components/InboxPlanEntityGraph';
import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';

const StyledContextCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
`;

// What an item about a record is about: the summary, one chip for the thing
// itself and the chain of records around it.
export const InboxItemRecordContext = () => {
  const { inboxItem } = useInboxItemPlanContext();
  const { context, summary } = inboxItem;

  const hasContext =
    isNonEmptyString(summary) ||
    isDefined(context.source) ||
    isDefined(inboxItem.threadId) ||
    isDefined(inboxItem.subjectRecordId) ||
    inboxItem.records.length > 0;

  if (!hasContext) {
    return null;
  }

  return (
    <StyledContextCard>
      {isNonEmptyString(summary) && <StyledSummary>{summary}</StyledSummary>}
      <InboxItemSubjectChip
        inboxItem={inboxItem}
        source={context.source ?? undefined}
      />
      <InboxPlanEntityGraph records={inboxItem.records} />
    </StyledContextCard>
  );
};
