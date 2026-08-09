import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemContext } from '@/inbox/components/InboxItemContext';
import { useSelectedInboxItem } from '@/inbox/hooks/useSelectedInboxItem';

const StyledBar = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

// The notification context, sitting above whatever the item is about. The
// subject renders itself below in its own side panel page, so a failed run
// looks like a run and a conversation looks like a conversation.
export const InboxItemContextBar = () => {
  const { selectedInboxItem } = useSelectedInboxItem();

  if (!isDefined(selectedInboxItem)) {
    return null;
  }

  return (
    <StyledBar>
      <InboxItemContext inboxItem={selectedInboxItem} size="bar" />
    </StyledBar>
  );
};
