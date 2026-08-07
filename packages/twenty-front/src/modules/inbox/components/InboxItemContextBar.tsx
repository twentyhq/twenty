import { type ErrorLike } from '@apollo/client';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemActionInputModal } from '@/inbox/components/InboxItemActionInputModal';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { useSelectedInboxItem } from '@/inbox/hooks/useSelectedInboxItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type InboxItemAction, InboxItemStatus } from '~/generated/graphql';

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

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

// The notification context, sitting above whatever the item is about. The
// subject renders itself below in its own side panel page, so a failed run
// looks like a run and a conversation looks like a conversation.
export const InboxItemContextBar = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { selectedInboxItem } = useSelectedInboxItem();
  const { executeInboxItemAction, reopenInboxItem } = useInboxItemActions();
  const { enqueueErrorSnackBar } = useSnackBar();
  // Keyed by item, so switching selection while a form is open cannot submit
  // the old action against the new item
  const [pendingAction, setPendingAction] = useState<{
    inboxItemId: string;
    action: InboxItemAction;
  } | null>(null);

  if (!isDefined(selectedInboxItem)) {
    return null;
  }

  const runAction = async (run: () => Promise<void>) => {
    try {
      await run();

      return true;
    } catch (error) {
      enqueueErrorSnackBar({ apolloError: error as ErrorLike });

      return false;
    }
  };

  const InboxItemIcon = getIcon(selectedInboxItem.inboxItemType.icon);
  const isResolved = selectedInboxItem.status !== InboxItemStatus.OPEN;
  const outcomeLabel = selectedInboxItem.inboxItemType.outcomes.find(
    (outcome) => outcome.key === selectedInboxItem.outcome,
  )?.label;

  // Navigation actions are redundant here: the thing they would open is
  // already on screen underneath.
  const transitionActions = selectedInboxItem.inboxItemType.actions.filter(
    (action) => isDefined(action.transitionKind),
  );

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
      {isDefined(pendingAction) &&
      pendingAction.inboxItemId === selectedInboxItem.id ? (
        <InboxItemActionInputModal
          action={pendingAction.action}
          onCancel={() => setPendingAction(null)}
          onSubmit={async (input) => {
            // The form stays open when the mutation fails, so a conflict does
            // not silently swallow what was typed
            const hasSucceeded = await runAction(() =>
              executeInboxItemAction({
                inboxItemId: selectedInboxItem.id,
                actionKey: pendingAction.action.key,
                input,
                expectedVersion: selectedInboxItem.version,
              }),
            );

            if (hasSucceeded) {
              setPendingAction(null);
            }
          }}
        />
      ) : (
        <StyledActions>
          {isResolved ? (
            <Button
              onClick={() =>
                void runAction(() =>
                  reopenInboxItem({
                    inboxItemId: selectedInboxItem.id,
                    expectedVersion: selectedInboxItem.version,
                  }),
                )
              }
              size="small"
              title={t`Move to inbox`}
              variant="secondary"
            />
          ) : (
            transitionActions.map((action) => (
              <Button
                key={action.key}
                accent={action.isPrimary ? 'blue' : 'default'}
                onClick={() => {
                  if (action.inputSchema.length > 0) {
                    setPendingAction({
                      inboxItemId: selectedInboxItem.id,
                      action,
                    });

                    return;
                  }

                  void runAction(() =>
                    executeInboxItemAction({
                      inboxItemId: selectedInboxItem.id,
                      actionKey: action.key,
                      expectedVersion: selectedInboxItem.version,
                    }),
                  );
                }}
                size="small"
                title={action.label}
                variant={action.isPrimary ? 'primary' : 'secondary'}
              />
            ))
          )}
        </StyledActions>
      )}
    </StyledBar>
  );
};
