import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useToast } from 'twenty-ui/primitives/feedback';

import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { type InboxItem, InboxItemScope } from '~/generated/graphql';

const StyledButtons = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type InboxListRowButtonsProps = {
  inboxItem: InboxItem;
};

// The item's own actions live in the item pane, so the row only offers the one
// about who owns the work, which is what gets decided from the list.
export const InboxListRowButtons = ({
  inboxItem,
}: InboxListRowButtonsProps) => {
  const { t } = useLingui();
  const { assignInboxItem } = useInboxItemActions();
  const { enqueueToast } = useToast();

  const isInQueue =
    isDefined(inboxItem.queueId) && inboxItem.scope !== InboxItemScope.ARCHIVED;

  if (!isInQueue) {
    return null;
  }

  const isAssignedToSomeoneElse =
    isDefined(inboxItem.assigneeUserWorkspaceId) && !inboxItem.isAssignedToMe;

  const toggleOwnership = () =>
    void assignInboxItem({
      inboxItemId: inboxItem.id,
      ...(inboxItem.isAssignedToMe ? { toUserWorkspaceId: null } : {}),
      expectedVersion: inboxItem.version,
    }).catch(() =>
      enqueueToast({
        variant: 'error',
        children: t`That could not be applied`,
      }),
    );

  // Taking work a colleague already holds is a different act from picking up
  // something nobody has, so it does not borrow the same word.
  const getOwnershipLabel = () => {
    if (inboxItem.isAssignedToMe) {
      return t`Give back`;
    }

    return isAssignedToSomeoneElse ? t`Take over` : t`Take`;
  };

  return (
    <StyledButtons>
      <Button
        color={
          inboxItem.isAssignedToMe || isAssignedToSomeoneElse
            ? 'neutral'
            : 'accent'
        }
        onClick={toggleOwnership}
        size="sm"
        variant="outline"
      >
        {getOwnershipLabel()}
      </Button>
    </StyledButtons>
  );
};
