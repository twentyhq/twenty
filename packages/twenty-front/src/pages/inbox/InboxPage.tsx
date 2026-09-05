import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { SegmentedControl } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { InboxItemDetail } from '@/inbox/components/InboxItemDetail';
import { InboxList } from '@/inbox/components/InboxList';
import { useInboxItems } from '@/inbox/hooks/useInboxItems';
import { useInboxQueues } from '@/inbox/hooks/useInboxQueues';
import { useOpenInboxItem } from '@/inbox/hooks/useOpenInboxItem';
import { isInboxSplitViewOpenState } from '@/inbox/states/isInboxSplitViewOpenState';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';
import { collapseNavigationDrawerForInboxPanel } from '@/inbox/utils/collapseNavigationDrawerForInboxPanel';
import { restoreNavigationDrawerAfterInboxPanel } from '@/inbox/utils/restoreNavigationDrawerAfterInboxPanel';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { getRenderedInboxItemOrder } from '@/inbox/utils/getRenderedInboxItemOrder';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type InboxItem,
  InboxItemScope,
  InboxQueueAssignment,
} from '~/generated/graphql';

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
  // A shared inbox opens on what nobody has picked up, because that is the
  // question it exists to answer.
  const [queueAssignment, setQueueAssignment] = useState<InboxQueueAssignment>(
    InboxQueueAssignment.UNASSIGNED,
  );
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const { inboxSectionSlug, inboxQueueSlug, inboxItemId } = useParams<{
    inboxSectionSlug?: string;
    inboxQueueSlug?: string;
    inboxItemId?: string;
  }>();
  const { getIcon } = useIcons();
  const { inboxQueues } = useInboxQueues({ isPolling: true });

  const inboxQueue = inboxQueues.find((queue) => queue.slug === inboxQueueSlug);
  const inboxSection = findInboxSectionBySlug(inboxSectionSlug);
  const QueueIcon = getIcon(inboxQueue?.icon);
  const SectionIcon = isDefined(inboxQueueSlug) ? QueueIcon : inboxSection.Icon;
  const inboxSectionSlugToUse = inboxSection.slug;
  const inboxListLocation = useMemo<InboxListLocation>(
    () =>
      isDefined(inboxQueueSlug)
        ? { inboxQueueSlug }
        : { inboxSectionSlug: inboxSectionSlugToUse },
    [inboxQueueSlug, inboxSectionSlugToUse],
  );

  const {
    isInboxEnabled,
    inboxItems,
    isInitialLoading,
    error,
    hasMoreItems,
    loadMoreItems,
  } = useInboxItems(
    isDefined(inboxQueueSlug) ? InboxItemScope.INBOX : inboxSection.scope,
    inboxQueueSlug,
    isDefined(inboxQueueSlug) ? queueAssignment : undefined,
  );
  const { openInboxItem } = useOpenInboxItem(inboxListLocation);
  const shouldSplitByPriority =
    isDefined(inboxQueueSlug) || inboxSection.scope === InboxItemScope.INBOX;

  const openItem = (inboxItem: InboxItem) =>
    openInboxItem(
      inboxItem,
      getRenderedInboxItemOrder({ inboxItems, shouldSplitByPriority }),
    );

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
              title={inboxQueue?.name ?? t(inboxSection.label)}
              actionButton={
                isDefined(inboxQueueSlug) && (
                  <SegmentedControl
                    ariaLabel={t`Filter this shared inbox`}
                    itemWidth="content"
                    value={queueAssignment}
                    onChange={setQueueAssignment}
                    options={[
                      {
                        value: InboxQueueAssignment.UNASSIGNED,
                        label: t`Unassigned`,
                      },
                      {
                        value: InboxQueueAssignment.ASSIGNED,
                        label: t`Assigned`,
                      },
                      { value: InboxQueueAssignment.ALL, label: t`All` },
                    ]}
                  />
                )
              }
            />
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
                  shouldSplitByPriority={shouldSplitByPriority}
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
              listTitle={inboxQueue?.name ?? t(inboxSection.label)}
              showBackToList={isMobile}
            />
          </StyledItemPane>
        )}
      </StyledSplit>
    </PageCardLayout>
  );
};
