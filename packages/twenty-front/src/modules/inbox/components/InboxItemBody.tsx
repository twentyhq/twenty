import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemFeaturedSlot } from '@/inbox/components/InboxItemFeaturedSlot';
import { InboxItemPlanSlot } from '@/inbox/components/InboxItemPlanSlot';
import { InboxItemRecordContext } from '@/inbox/components/InboxItemRecordContext';
import { InboxItemThreadContext } from '@/inbox/components/InboxItemThreadContext';
import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';

const StyledScroll = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

// The only thing in the pane that scrolls. What the item is about comes
// first, then the call that takes the body, then the rest of the plan; a
// thread item and a record item differ only in the first of the three.
export const InboxItemBody = () => {
  const { messageThreadId } = useInboxItemPlanContext();

  return (
    <StyledScroll>
      {isDefined(messageThreadId) ? (
        <InboxItemThreadContext messageThreadId={messageThreadId} />
      ) : (
        <InboxItemRecordContext />
      )}
      <InboxItemFeaturedSlot />
      <InboxItemPlanSlot />
    </StyledScroll>
  );
};
