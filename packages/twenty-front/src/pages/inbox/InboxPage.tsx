import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxTable } from '@/inbox/components/InboxTable';
import { useInboxItems } from '@/inbox/hooks/useInboxItems';
import { useOpenInboxItem } from '@/inbox/hooks/useOpenInboxItem';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InboxItemScope } from '~/generated/graphql';

const StyledTablePane = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  padding: 0 ${themeCssVariables.spacing[4]};
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
    isInboxEnabled,
    inboxItems,
    needsActionItems,
    otherItems,
    isInitialLoading,
    error,
    hasMoreItems,
    loadMoreItems,
  } = useInboxItems(inboxSection.scope);
  const { openInboxItem } = useOpenInboxItem();
  const selectedInboxItemId = useAtomStateValue(selectedInboxItemIdState);

  // Deriving the selection from the loaded page keeps the reading pane honest:
  // switching section, resolving an item or losing it to a poll all drop it
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
          title={t(inboxSection.label)}
        />
      }
    >
      <StyledTablePane>
        {isDefined(error) && inboxItems.length === 0 ? (
          <StyledErrorState>{t`Your inbox could not be loaded`}</StyledErrorState>
        ) : (
          <InboxTable
            loading={isInitialLoading}
            inboxItems={inboxItems}
            needsActionItems={needsActionItems}
            otherItems={otherItems}
            selectedInboxItemId={selectedInboxItemId}
            hasMoreItems={hasMoreItems}
            shouldSplitByPriority={inboxSection.scope === InboxItemScope.INBOX}
            onInboxItemClick={openInboxItem}
            onLoadMoreItems={loadMoreItems}
          />
        )}
      </StyledTablePane>
    </PageCardLayout>
  );
};
