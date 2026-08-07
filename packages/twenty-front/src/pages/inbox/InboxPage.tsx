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
import { type InboxItem } from '~/generated/graphql';

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
  width: 360px;
`;

export const InboxPage = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { inboxSectionSlug } = useParams<{ inboxSectionSlug?: string }>();

  const inboxSection = findInboxSectionBySlug(inboxSectionSlug);
  const SectionIcon = inboxSection.Icon;

  const {
    needsActionItems,
    otherItems,
    isInitialLoading,
    hasMoreItems,
    loadMoreItems,
  } = useInboxItems(inboxSection.scope);
  const { markInboxItemRead } = useInboxItemActions();
  const [selectedInboxItemId, setSelectedInboxItemId] = useAtomState(
    selectedInboxItemIdState,
  );

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
          <InboxTable
            loading={isInitialLoading}
            needsActionItems={needsActionItems}
            otherItems={otherItems}
            selectedInboxItemId={selectedInboxItemId}
            hasMoreItems={hasMoreItems}
            onInboxItemClick={handleInboxItemClick}
            onLoadMoreItems={loadMoreItems}
          />
        </StyledTablePane>
        {isDefined(selectedInboxItemId) && (
          <StyledDetailPane>
            <InboxItemDetailCard
              inboxItemId={selectedInboxItemId}
              scope={inboxSection.scope}
            />
          </StyledDetailPane>
        )}
      </StyledPanes>
    </PageCardLayout>
  );
};
