import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type InboxItem, InboxItemScope } from '~/generated/graphql';

const StyledButtons = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type InboxListRowButtonsProps = {
  inboxItem: InboxItem;
};

// The item's own actions live in the item pane beside the list; the row only
// offers the one that is about who owns the work, since that is decided from
// the list. Taking and giving back are the same transition with a different
// target.
export const InboxListRowButtons = ({
  inboxItem,
}: InboxListRowButtonsProps) => {
  const { t } = useLingui();
  const { assignInboxItem } = useInboxItemActions();
  const { enqueueErrorSnackBar } = useSnackBar();

  const isInQueue =
    isDefined(inboxItem.queueId) && inboxItem.scope !== InboxItemScope.DONE;

  if (!isInQueue) {
    return null;
  }

  const toggleOwnership = () =>
    void assignInboxItem({
      inboxItemId: inboxItem.id,
      ...(inboxItem.isAssignedToMe ? { toUserWorkspaceId: null } : {}),
      expectedVersion: inboxItem.version,
    }).catch(() =>
      enqueueErrorSnackBar({ message: t`That could not be applied` }),
    );

  return (
    <StyledButtons>
      <Button
        accent={inboxItem.isAssignedToMe ? 'default' : 'blue'}
        onClick={toggleOwnership}
        size="small"
        title={inboxItem.isAssignedToMe ? t`Give back` : t`Take`}
        variant="secondary"
      />
    </StyledButtons>
  );
};
