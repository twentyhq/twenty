import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxListRow } from '@/inbox/components/InboxListRow';
import { InboxListSection } from '@/inbox/components/InboxListSection';
import { InboxListSkeletonLoader } from '@/inbox/components/InboxListSkeletonLoader';
import { partitionInboxItemsByPriority } from '@/inbox/utils/partitionInboxItemsByPriority';
import { type InboxItem } from '~/generated/graphql';

const StyledLoadMore = styled.div`
  align-self: flex-start;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[1]};
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
  selectedInboxItemId: string | null;
  hasMoreItems: boolean;
  // Splitting by priority only earns its keep where work is still pending
  shouldSplitByPriority: boolean;
  onInboxItemClick: (inboxItem: InboxItem) => void;
  onInboxItemOpenInSidePanel: (inboxItem: InboxItem) => void;
  onLoadMoreItems: () => void;
};

export const InboxList = ({
  loading,
  inboxItems,
  selectedInboxItemId,
  hasMoreItems,
  shouldSplitByPriority,
  onInboxItemClick,
  onInboxItemOpenInSidePanel,
  onLoadMoreItems,
}: InboxListProps) => {
  const { t } = useLingui();

  const { needsActionItems, otherItems } =
    partitionInboxItemsByPriority(inboxItems);
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
        onOpenInSidePanel={() => onInboxItemOpenInSidePanel(inboxItem)}
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
        <StyledLoadMore>
          <LightButton
            accent="tertiary"
            title={t`Load older`}
            onClick={onLoadMoreItems}
          />
        </StyledLoadMore>
      )}
    </StyledContainer>
  );
};
