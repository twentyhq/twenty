import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { InboxItemDetail } from '@/inbox/components/InboxItemDetail';
import { InboxList } from '@/inbox/components/InboxList';
import { DEFAULT_INBOX_QUEUE_VIEW } from '@/inbox/constants/DefaultInboxQueueView';
import {
  INBOX_QUEUE_VIEWS,
  type InboxQueueViewKey,
} from '@/inbox/constants/InboxQueueViews';
import { useInboxItems } from '@/inbox/hooks/useInboxItems';
import { useInboxQueues } from '@/inbox/hooks/useInboxQueues';
import { useOpenInboxItem } from '@/inbox/hooks/useOpenInboxItem';
import { isInboxSplitViewOpenState } from '@/inbox/states/isInboxSplitViewOpenState';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';
import { collapseNavigationDrawerForInboxPanel } from '@/inbox/utils/collapseNavigationDrawerForInboxPanel';
import { restoreNavigationDrawerAfterInboxPanel } from '@/inbox/utils/restoreNavigationDrawerAfterInboxPanel';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';

const INBOX_LIST_PANE_WIDTH = 400;

const StyledSplit = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
`;

const StyledListPane = styled.div<{ isAlone: boolean }>`
  border-right: ${({ isAlone }) =>
    isAlone ? 'none' : `1px solid ${themeCssVariables.border.color.light}`};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  width: ${({ isAlone }) => (isAlone ? '100%' : `${INBOX_LIST_PANE_WIDTH}px`)};
`;

const StyledTabsContainer = styled.div`
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledListBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledItemPane = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
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

// A panel already open on the way in pushes the drawer aside the same way a
// panel opened later does. Without one, a drawer still owed from an earlier
// visit is handed back now, so a memory left behind by a closed tab cannot fire
// on a later, unrelated panel.
const InboxSplitViewEffect = () => {
  const store = useStore();
  const setIsInboxSplitViewOpen = useSetAtomState(isInboxSplitViewOpenState);

  useEffect(() => {
    setIsInboxSplitViewOpen(true);

    if (store.get(isSidePanelOpenedState.atom)) {
      collapseNavigationDrawerForInboxPanel(store);
    } else {
      restoreNavigationDrawerAfterInboxPanel(store);
    }

    return () => {
      setIsInboxSplitViewOpen(false);
      restoreNavigationDrawerAfterInboxPanel(store);
    };
  }, [setIsInboxSplitViewOpen, store]);

  return null;
};

export const InboxPage = () => {
  const { t } = useLingui();
  const [inboxQueueViewKey, setInboxQueueViewKey] = useState<InboxQueueViewKey>(
    DEFAULT_INBOX_QUEUE_VIEW.key,
  );
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const { inboxSectionSlug, inboxQueueName, inboxItemId } = useParams<{
    inboxSectionSlug?: string;
    inboxQueueName?: string;
    inboxItemId?: string;
  }>();
  const { getIcon } = useIcons();
  const { inboxQueues } = useInboxQueues({ isPolling: true });

  const inboxQueue = inboxQueues.find((queue) => queue.name === inboxQueueName);
  const inboxSection = findInboxSectionBySlug(inboxSectionSlug);
  const inboxQueueView =
    INBOX_QUEUE_VIEWS.find((view) => view.key === inboxQueueViewKey) ??
    DEFAULT_INBOX_QUEUE_VIEW;
  const listScope = isDefined(inboxQueueName)
    ? inboxQueueView.scope
    : inboxSection.scope;
  const QueueIcon = getIcon(inboxQueue?.icon);
  const SectionIcon = isDefined(inboxQueueName) ? QueueIcon : inboxSection.Icon;
  const inboxSectionSlugToUse = inboxSection.slug;
  const inboxListLocation = useMemo<InboxListLocation>(
    () =>
      isDefined(inboxQueueName)
        ? { inboxQueueName }
        : { inboxSectionSlug: inboxSectionSlugToUse },
    [inboxQueueName, inboxSectionSlugToUse],
  );

  const {
    isInboxEnabled,
    inboxItems,
    isInitialLoading,
    error,
    hasMoreItems,
    loadMoreItems,
  } = useInboxItems({
    scope: listScope,
    queueName: inboxQueueName,
    assignment: isDefined(inboxQueueName)
      ? inboxQueueView.assignment
      : undefined,
  });
  const { openInboxItem } = useOpenInboxItem(inboxListLocation);

  const openItem = (inboxItem: InboxItem) =>
    openInboxItem(inboxItem, inboxItems);

  const handleQueueViewChange = useCallback((tabId: string) => {
    const view = INBOX_QUEUE_VIEWS.find((candidate) => candidate.key === tabId);

    if (isDefined(view)) {
      setInboxQueueViewKey(view.key);
    }
  }, []);

  // With the flag off the inbox is not a surface, so a direct visit lands on
  // the app index rather than on an empty shell.
  if (!isInboxEnabled) {
    return <Navigate to={AppPath.Index} replace />;
  }

  const isListVisible = !isMobile || !isDefined(inboxItemId);
  const isItemVisible = !isMobile || isDefined(inboxItemId);

  return (
    <PageCardLayout header={null}>
      <InboxSplitViewEffect />
      <StyledSplit>
        {isListVisible && (
          <StyledListPane isAlone={!isItemVisible}>
            <PageCardHeader
              icon={<SectionIcon size={theme.icon.size.md} />}
              title={inboxQueue?.label ?? t(inboxSection.label)}
            />
            {isDefined(inboxQueueName) && (
              <StyledTabsContainer>
                <TabList
                  aria-label={t`Inbox views`}
                  tabs={INBOX_QUEUE_VIEWS.map((view) => ({
                    id: view.key,
                    title: t(view.label),
                  }))}
                  behaveAsLinks={false}
                  componentInstanceId={`inbox-queue-views-${inboxQueueName}`}
                  onChangeTab={handleQueueViewChange}
                />
              </StyledTabsContainer>
            )}
            <StyledListBody>
              {isDefined(error) && inboxItems.length === 0 ? (
                <StyledErrorState>
                  {t`Your inbox could not be loaded`}
                </StyledErrorState>
              ) : (
                <InboxList
                  loading={isInitialLoading}
                  inboxItems={inboxItems}
                  selectedInboxItemId={inboxItemId ?? null}
                  hasMoreItems={hasMoreItems}
                  isSharedInboxList={isDefined(inboxQueueName)}
                  onInboxItemClick={openItem}
                  onLoadMoreItems={loadMoreItems}
                />
              )}
            </StyledListBody>
          </StyledListPane>
        )}
        {isItemVisible && (
          <StyledItemPane>
            <InboxItemDetail
              key={inboxItemId}
              inboxItemId={inboxItemId}
              inboxListLocation={inboxListLocation}
              listTitle={inboxQueue?.label ?? t(inboxSection.label)}
              showBackToList={isMobile}
            />
          </StyledItemPane>
        )}
      </StyledSplit>
    </PageCardLayout>
  );
};
