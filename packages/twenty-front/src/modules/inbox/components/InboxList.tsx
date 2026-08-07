import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemGroup } from '@/inbox/components/InboxItemGroup';
import { InboxListSkeletonLoader } from '@/inbox/components/InboxListSkeletonLoader';
import { groupInboxItemsByDate } from '@/inbox/utils/groupInboxItemsByDate';
import { isDefined } from 'twenty-shared/utils';
import { type InboxItem } from '~/generated/graphql';

const StyledLoadMoreButton = styled.button`
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
`;

type InboxListProps = {
  loading: boolean;
  needsActionItems: InboxItem[];
  otherItems: InboxItem[];
  hasMoreItems?: boolean;
  onLoadMoreItems?: () => void;
};

export const InboxList = ({
  loading,
  needsActionItems,
  otherItems,
  hasMoreItems = false,
  onLoadMoreItems,
}: InboxListProps) => {
  const { t } = useLingui();

  const dateGroups = groupInboxItemsByDate(otherItems);
  const hasNeedsActionSection = needsActionItems.length > 0;

  if (!hasNeedsActionSection && dateGroups.length === 0) {
    return loading ? (
      <InboxListSkeletonLoader />
    ) : (
      <StyledEmptyState>{t`Your inbox is empty`}</StyledEmptyState>
    );
  }

  return (
    <>
      {hasNeedsActionSection && (
        <InboxItemGroup
          title={t`Needs attention`}
          inboxItems={needsActionItems}
        />
      )}
      {dateGroups.map((dateGroup) => (
        <InboxItemGroup
          key={dateGroup.id}
          title={dateGroup.title}
          inboxItems={dateGroup.inboxItems}
        />
      ))}
      {hasMoreItems && isDefined(onLoadMoreItems) && (
        <StyledLoadMoreButton type="button" onClick={onLoadMoreItems}>
          {t`Load older`}
        </StyledLoadMoreButton>
      )}
    </>
  );
};
