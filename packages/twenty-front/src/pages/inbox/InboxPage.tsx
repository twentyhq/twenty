import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemDetailCard } from '@/inbox/components/InboxItemDetailCard';
import { InboxTable } from '@/inbox/components/InboxTable';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { useInboxItems } from '@/inbox/hooks/useInboxItems';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type InboxItem, InboxItemScope } from '~/generated/graphql';

const StyledPanes = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const StyledTablePane = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledDetailPane = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  overflow-y: auto;
  width: 360px;
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
  const { inboxSectionSlug } = useParams<{ inboxSectionSlug?: string }>();

  const inboxSection = findInboxSectionBySlug(inboxSectionSlug);
  const SectionIcon = inboxSection.Icon;

  const {
    inboxItems,
    needsActionItems,
    otherItems,
    isInitialLoading,
    error,
    hasMoreItems,
    loadMoreItems,
  } = useInboxItems(inboxSection.scope);
  const { markInboxItemRead } = useInboxItemActions();
  const [selectedInboxItemId, setSelectedInboxItemId] = useAtomState(
    selectedInboxItemIdState,
  );

  // Deriving the selection from the loaded page keeps the reading pane honest:
  // switching section, resolving an item or losing it to a poll all drop it
  const selectedInboxItem =
    inboxItems.find((inboxItem) => inboxItem.id === selectedInboxItemId) ??
    null;

  const handleInboxItemClick = (inboxItem: InboxItem) => {
    if (!isDefined(inboxItem.readAt)) {
      void markInboxItemRead(inboxItem.id);
    }

    setSelectedInboxItemId(inboxItem.id);
  };

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          icon={<SectionIcon size={theme.icon.size.md} />}
          title={t(inboxSection.label)}
        />
      }
    >
      <StyledPanes>
        <StyledTablePane>
          {isDefined(error) ? (
            <StyledErrorState>{t`Your inbox could not be loaded`}</StyledErrorState>
          ) : (
            <InboxTable
              loading={isInitialLoading}
              needsActionItems={needsActionItems}
              otherItems={otherItems}
              selectedInboxItemId={selectedInboxItem?.id ?? null}
              hasMoreItems={hasMoreItems}
              shouldSplitByPriority={
                inboxSection.scope === InboxItemScope.INBOX
              }
              onInboxItemClick={handleInboxItemClick}
              onLoadMoreItems={loadMoreItems}
            />
          )}
        </StyledTablePane>
        {isDefined(selectedInboxItem) && (
          <StyledDetailPane>
            <InboxItemDetailCard inboxItem={selectedInboxItem} />
          </StyledDetailPane>
        )}
      </StyledPanes>
    </PageCardLayout>
  );
};
