import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxList } from '@/inbox/components/InboxList';
import { useInboxItems } from '@/inbox/hooks/useInboxItems';
import { useInboxQueues } from '@/inbox/hooks/useInboxQueues';
import { useOpenInboxItemFullPage } from '@/inbox/hooks/useOpenInboxItemFullPage';
import { useOpenInboxItemInSidePanel } from '@/inbox/hooks/useOpenInboxItemInSidePanel';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { getRenderedInboxItemOrder } from '@/inbox/utils/getRenderedInboxItemOrder';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InboxItemScope } from '~/generated/graphql';

const StyledListPane = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledErrorState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
`;

export const InboxPage = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { inboxSectionSlug, inboxQueueSlug } = useParams<{
    inboxSectionSlug?: string;
    inboxQueueSlug?: string;
  }>();
  const { getIcon } = useIcons();
  const { inboxQueues } = useInboxQueues();

  // A shared inbox is the same list read through a queue, so the page differs
  // only in what it is called and which items it asks for.
  const inboxQueue = inboxQueues.find((queue) => queue.slug === inboxQueueSlug);
  const inboxSection = findInboxSectionBySlug(inboxSectionSlug);
  const QueueIcon = getIcon(inboxQueue?.icon);
  const SectionIcon = isDefined(inboxQueueSlug) ? QueueIcon : inboxSection.Icon;

  const {
    isInboxEnabled,
    inboxItems,
    needsActionItems,
    otherItems,
    isInitialLoading,
    error,
    hasMoreItems,
    loadMoreItems,
  } = useInboxItems(
    isDefined(inboxQueueSlug) ? InboxItemScope.INBOX : inboxSection.scope,
    inboxQueueSlug,
  );
  const { openInboxItemFullPage } = useOpenInboxItemFullPage(inboxSection);
  const { openInboxItemInSidePanel } = useOpenInboxItemInSidePanel();
  const selectedInboxItemId = useAtomStateValue(selectedInboxItemIdState);

  const shouldSplitByPriority =
    isDefined(inboxQueueSlug) || inboxSection.scope === InboxItemScope.INBOX;

  // With the flag off the inbox is not a surface, so a direct visit lands on
  // the app index rather than on an empty shell
  if (!isInboxEnabled) {
    return <Navigate to={AppPath.Index} replace />;
  }

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          icon={<SectionIcon size={theme.icon.size.md} />}
          title={inboxQueue?.name ?? t(inboxSection.label)}
        />
      }
    >
      <StyledListPane>
        {isDefined(error) && inboxItems.length === 0 ? (
          <StyledErrorState>{t`Your inbox could not be loaded`}</StyledErrorState>
        ) : (
          <InboxList
            loading={isInitialLoading}
            inboxItems={inboxItems}
            needsActionItems={needsActionItems}
            otherItems={otherItems}
            selectedInboxItemId={selectedInboxItemId}
            hasMoreItems={hasMoreItems}
            shouldSplitByPriority={shouldSplitByPriority}
            onInboxItemClick={(inboxItem) =>
              openInboxItemFullPage(
                inboxItem,
                getRenderedInboxItemOrder({
                  inboxItems,
                  needsActionItems,
                  otherItems,
                  shouldSplitByPriority,
                }),
              )
            }
            onInboxItemOpenInSidePanel={openInboxItemInSidePanel}
            onLoadMoreItems={loadMoreItems}
          />
        )}
      </StyledListPane>
    </PageCardLayout>
  );
};
