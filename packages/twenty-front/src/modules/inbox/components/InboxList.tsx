import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxListRow } from '@/inbox/components/InboxListRow';
import { InboxListSkeletonLoader } from '@/inbox/components/InboxListSkeletonLoader';
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
  // Taking work off a row is triage, which only happens where the team's
  // unclaimed work is listed.
  isSharedInboxList: boolean;
  onInboxItemClick: (inboxItem: InboxItem) => void;
  onLoadMoreItems: () => void;
};

export const InboxList = ({
  loading,
  inboxItems,
  selectedInboxItemId,
  hasMoreItems,
  isSharedInboxList,
  onInboxItemClick,
  onLoadMoreItems,
}: InboxListProps) => {
  const { t } = useLingui();

  if (inboxItems.length === 0) {
    return loading ? (
      <InboxListSkeletonLoader />
    ) : (
      <StyledEmptyState>{t`Nothing to do here`}</StyledEmptyState>
    );
  }

  return (
    <StyledContainer>
      {inboxItems.map((inboxItem) => (
        <InboxListRow
          key={inboxItem.id}
          inboxItem={inboxItem}
          isSelected={selectedInboxItemId === inboxItem.id}
          isSharedInboxList={isSharedInboxList}
          onClick={() => onInboxItemClick(inboxItem)}
        />
      ))}
      {hasMoreItems && (
        <StyledLoadMore>
          <LightButton emphasis="subtle" onClick={onLoadMoreItems}>
            {t`Load older`}
          </LightButton>
        </StyledLoadMore>
      )}
    </StyledContainer>
  );
};
