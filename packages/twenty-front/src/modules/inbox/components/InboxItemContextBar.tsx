import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemActions } from '@/inbox/components/InboxItemActions';
import { useSelectedInboxItem } from '@/inbox/hooks/useSelectedInboxItem';

const StyledBar = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledOutcome = styled.div`
  align-self: flex-start;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

// The notification context, sitting above whatever the item is about. The
// subject renders itself below in its own side panel page, so a failed run
// looks like a run and a conversation looks like a conversation.
export const InboxItemContextBar = () => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { selectedInboxItem } = useSelectedInboxItem();

  if (!isDefined(selectedInboxItem)) {
    return null;
  }

  const InboxItemIcon = getIcon(selectedInboxItem.inboxItemType.icon);
  const outcomeLabel = selectedInboxItem.inboxItemType.outcomes.find(
    (outcome) => outcome.key === selectedInboxItem.outcome,
  )?.label;

  return (
    <StyledBar>
      <StyledHeader>
        <InboxItemIcon size={theme.icon.size.sm} color="currentColor" />
        {selectedInboxItem.inboxItemType.label}
      </StyledHeader>
      <StyledTitle>{selectedInboxItem.title}</StyledTitle>
      {isNonEmptyString(selectedInboxItem.preview) && (
        <StyledPreview>{selectedInboxItem.preview}</StyledPreview>
      )}
      {isDefined(selectedInboxItem.outcome) && (
        <StyledOutcome>
          {outcomeLabel ?? selectedInboxItem.outcome}
        </StyledOutcome>
      )}
      <InboxItemActions inboxItem={selectedInboxItem} />
    </StyledBar>
  );
};
