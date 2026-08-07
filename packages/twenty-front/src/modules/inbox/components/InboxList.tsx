import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemGroup } from '@/inbox/components/InboxItemGroup';
import { groupInboxItemsByDate } from '@/inbox/utils/groupInboxItemsByDate';
import { type InboxItem } from '~/generated/graphql';

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
};

export const InboxList = ({
  loading,
  needsActionItems,
  otherItems,
}: InboxListProps) => {
  const { t } = useLingui();

  const dateGroups = groupInboxItemsByDate(otherItems);
  const hasNeedsActionSection = needsActionItems.length > 0;

  if (!hasNeedsActionSection && dateGroups.length === 0) {
    return loading ? null : (
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
    </>
  );
};
