import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxListRow } from '@/inbox/components/InboxListRow';
import { InboxListSection } from '@/inbox/components/InboxListSection';
import { InboxListSkeletonLoader } from '@/inbox/components/InboxListSkeletonLoader';
import { type InboxItem } from '~/generated/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledLoadMoreButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
`;

type InboxListProps = {
  loading: boolean;
  inboxItems: InboxItem[];
  needsActionItems: InboxItem[];
  otherItems: InboxItem[];
  selectedInboxItemId: string | null;
  hasMoreItems: boolean;
  // Splitting by priority only earns its keep where work is still pending
  shouldSplitByPriority: boolean;
  onInboxItemClick: (inboxItem: InboxItem) => void;
  onLoadMoreItems: () => void;
};

export const InboxList = ({
  loading,
  inboxItems,
  needsActionItems,
  otherItems,
  selectedInboxItemId,
  hasMoreItems,
  shouldSplitByPriority,
  onInboxItemClick,
  onLoadMoreItems,
}: InboxListProps) => {
  const { t } = useLingui();

  const hasNeedsActionSection =
    shouldSplitByPriority && needsActionItems.length > 0;
  // Concatenating the priority buckets would bury a recent low priority item
  // under an older one that needs action, so the flat path keeps the sort
  const flatItems = shouldSplitByPriority ? otherItems : inboxItems;

  if (inboxItems.length === 0) {
    return loading ? (
      <InboxListSkeletonLoader />
    ) : (
      <StyledEmptyState>{t`Nothing to do here`}</StyledEmptyState>
    );
  }

  const renderRows = (rowItems: InboxItem[]) =>
    rowItems.map((inboxItem) => (
      <InboxListRow
        key={inboxItem.id}
        inboxItem={inboxItem}
        isSelected={selectedInboxItemId === inboxItem.id}
        onClick={() => onInboxItemClick(inboxItem)}
      />
    ));

  return (
    <StyledContainer>
      {hasNeedsActionSection ? (
        <>
          <InboxListSection
            title={t`Needs attention`}
            itemCount={needsActionItems.length}
          >
            {renderRows(needsActionItems)}
          </InboxListSection>
          {otherItems.length > 0 && (
            <InboxListSection
              title={t`Everything else`}
              itemCount={otherItems.length}
            >
              {renderRows(otherItems)}
            </InboxListSection>
          )}
        </>
      ) : (
        renderRows(flatItems)
      )}
      {hasMoreItems && (
        <StyledLoadMoreButton type="button" onClick={onLoadMoreItems}>
          {t`Load older`}
        </StyledLoadMoreButton>
      )}
    </StyledContainer>
  );
};
