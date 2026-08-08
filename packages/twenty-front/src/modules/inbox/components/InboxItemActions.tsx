import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemActionInputModal } from '@/inbox/components/InboxItemActionInputModal';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import {
  type InboxItem,
  type InboxItemAction,
  InboxItemStatus,
} from '~/generated/graphql';

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

// Shared by the side panel context bar and the focused page, so an action
// behaves the same whichever way the item was opened.
export const InboxItemActions = ({ inboxItem }: { inboxItem: InboxItem }) => {
  const { t } = useLingui();
  const { executeInboxItemAction, reopenInboxItem } = useInboxItemActions();
  // Keyed by item, so switching selection while a form is open cannot submit
  // the old action against the new item
  const [pendingAction, setPendingAction] = useState<{
    inboxItemId: string;
    action: InboxItemAction;
  } | null>(null);

  const isResolved = inboxItem.status !== InboxItemStatus.OPEN;

  // Navigation actions are redundant here: the thing they would open is
  // already on screen underneath.
  const transitionActions = inboxItem.inboxItemType.actions.filter((action) =>
    isDefined(action.transitionKind),
  );

  if (
    isDefined(pendingAction) &&
    pendingAction.inboxItemId === inboxItem.id
  ) {
    return (
      <InboxItemActionInputModal
        action={pendingAction.action}
        onCancel={() => setPendingAction(null)}
        onSubmit={async (input) => {
          // The form stays until the mutation lands, so a conflict does not
          // silently swallow what was typed
          await executeInboxItemAction({
            inboxItemId: inboxItem.id,
            actionKey: pendingAction.action.key,
            input,
            expectedVersion: inboxItem.version,
          });
          setPendingAction(null);
        }}
      />
    );
  }

  return (
    <StyledActions>
      {isResolved ? (
        <Button
          onClick={() =>
            void reopenInboxItem({
              inboxItemId: inboxItem.id,
              expectedVersion: inboxItem.version,
            })
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
                setPendingAction({ inboxItemId: inboxItem.id, action });

                return;
              }

              void executeInboxItemAction({
                inboxItemId: inboxItem.id,
                actionKey: action.key,
                expectedVersion: inboxItem.version,
              });
            }}
            size="small"
            title={action.label}
            variant={action.isPrimary ? 'primary' : 'secondary'}
          />
        ))
      )}
    </StyledActions>
  );
};
