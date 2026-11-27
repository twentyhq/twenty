import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { InboxViewList } from '@/inbox/components/InboxViewList';
import { INBOX_INSTANCE_ID } from '@/inbox/constants/InboxInstanceId';

const StyledListPane = styled.div`
  display: flex;
  flex: 0 0 auto;
  min-width: 0;
  width: var(--inbox-list-pane-width);
`;

// The page's context store targets the open thread, so the list keeps its own
export const InboxViewListPane = () => {
  const { t } = useLingui();

  return (
    <StyledListPane role="region" aria-label={t`Conversation list`}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: INBOX_INSTANCE_ID }}
      >
        <InboxViewList />
      </ContextStoreComponentInstanceContext.Provider>
    </StyledListPane>
  );
};
