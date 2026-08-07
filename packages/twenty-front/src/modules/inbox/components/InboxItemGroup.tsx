import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxListItem } from '@/inbox/components/InboxListItem';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { type InboxItem } from '~/generated/graphql';

const StyledInboxItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledInboxItemGroup = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

type InboxItemGroupProps = {
  alwaysShowRightIcon?: boolean;
  inboxItems: InboxItem[];
  rightIcon?: ReactNode;
  title: string;
};

export const InboxItemGroup = ({
  alwaysShowRightIcon = false,
  inboxItems,
  rightIcon,
  title,
}: InboxItemGroupProps) => {
  if (inboxItems.length === 0) {
    return null;
  }

  return (
    <StyledInboxItemGroup>
      <NavigationDrawerSectionTitle
        label={title}
        alwaysShowRightIcon={alwaysShowRightIcon}
        rightIcon={rightIcon}
      />
      <StyledInboxItemsList>
        {inboxItems.map((inboxItem) => (
          <InboxListItem key={inboxItem.id} inboxItem={inboxItem} />
        ))}
      </StyledInboxItemsList>
    </StyledInboxItemGroup>
  );
};
