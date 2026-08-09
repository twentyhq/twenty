import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemActions } from '@/inbox/components/InboxItemActions';
import { type InboxItem } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
`;

// The focused page's title is the page's heading; the side panel's rides above
// whatever the panel is showing, so it is not one.
const StyledPageTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledBarTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};

  &[data-size='page'] {
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.md};
  }

  &[data-size='bar'] {
    font-size: ${themeCssVariables.font.size.sm};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StyledOutcome = styled.div`
  align-self: flex-start;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

// What the item is, above whatever it is about. The focused page and the side
// panel show the same thing at different sizes, so they render this rather than
// each keeping their own copy.
export const InboxItemContext = ({
  inboxItem,
  size,
}: {
  inboxItem: InboxItem;
  size: 'bar' | 'page';
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);
  const outcomeLabel = inboxItem.inboxItemType.outcomes.find(
    (outcome) => outcome.key === inboxItem.outcome,
  )?.label;

  return (
    <StyledContainer>
      <StyledHeader>
        <InboxItemIcon size={theme.icon.size.sm} color="currentColor" />
        {inboxItem.inboxItemType.label}
      </StyledHeader>
      {size === 'page' ? (
        <StyledPageTitle>{inboxItem.title}</StyledPageTitle>
      ) : (
        <StyledBarTitle>{inboxItem.title}</StyledBarTitle>
      )}
      {isNonEmptyString(inboxItem.preview) && (
        <StyledPreview data-size={size}>{inboxItem.preview}</StyledPreview>
      )}
      {isDefined(inboxItem.outcome) && (
        <StyledOutcome>{outcomeLabel ?? inboxItem.outcome}</StyledOutcome>
      )}
      <InboxItemActions inboxItem={inboxItem} />
    </StyledContainer>
  );
};
