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

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledOutcome = styled.div`
  align-self: flex-start;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

// What the item is, above whatever it is about. Only the focused page shows
// this: the side panel shows the subject alone, because an inbox item's context
// riding above an unrelated record is worse than no context at all.
export const InboxItemContext = ({ inboxItem }: { inboxItem: InboxItem }) => {
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
      <StyledPageTitle>{inboxItem.title}</StyledPageTitle>
      {isNonEmptyString(inboxItem.preview) && (
        <StyledPreview>{inboxItem.preview}</StyledPreview>
      )}
      {isDefined(inboxItem.outcome) && (
        <StyledOutcome>{outcomeLabel ?? inboxItem.outcome}</StyledOutcome>
      )}
      <InboxItemActions inboxItem={inboxItem} />
    </StyledContainer>
  );
};
