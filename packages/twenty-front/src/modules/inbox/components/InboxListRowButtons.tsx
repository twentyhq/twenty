import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
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
  onOpenInSidePanel: () => void;
};

// Actions that declare input need a form, which does not belong on a list row,
// so only the input-free ones are offered here. Everything else stays behind
// the side panel or the focused page.
export const InboxListRowButtons = ({
  inboxItem,
  onOpenInSidePanel,
}: InboxListRowButtonsProps) => {
  const { t } = useLingui();
  const { executeInboxItemAction, assignInboxItem } = useInboxItemActions();
  const { enqueueErrorSnackBar } = useSnackBar();

  const inlineActions =
    inboxItem.scope !== InboxItemScope.DONE
      ? inboxItem.inboxItemType.actions.filter(
          (action) =>
            isDefined(action.transitionKind) && action.inputSchema.length === 0,
        )
      : [];

  // Taking work out of a shared inbox is the one action that is about who owns
  // it rather than what it is, so it is offered before the type's own actions.
  const isInQueue = isDefined(inboxItem.queueId);

  const takeInboxItem = () =>
    void assignInboxItem({
      inboxItemId: inboxItem.id,
      expectedVersion: inboxItem.version,
    }).catch(() =>
      enqueueErrorSnackBar({ message: t`That could not be applied` }),
    );

  const giveInboxItemBack = () =>
    void assignInboxItem({
      inboxItemId: inboxItem.id,
      toUserWorkspaceId: null,
      expectedVersion: inboxItem.version,
    }).catch(() =>
      enqueueErrorSnackBar({ message: t`That could not be applied` }),
    );

  return (
    <StyledButtons>
      {isInQueue && !inboxItem.isAssignedToMe && (
        <Button
          accent="blue"
          onClick={takeInboxItem}
          size="small"
          title={t`Take`}
          variant="secondary"
        />
      )}
      {isInQueue && inboxItem.isAssignedToMe && (
        <Button
          onClick={giveInboxItemBack}
          size="small"
          title={t`Give back`}
          variant="secondary"
        />
      )}
      {inlineActions.map((action) => (
        <Button
          key={action.key}
          onClick={() =>
            void executeInboxItemAction({
              inboxItemId: inboxItem.id,
              actionKey: action.key,
              expectedVersion: inboxItem.version,
            }).catch(() =>
              enqueueErrorSnackBar({ message: t`That could not be applied` }),
            )
          }
          size="small"
          title={action.label}
          variant="secondary"
        />
      ))}
      <LightIconButton
        Icon={IconLayoutSidebarRightExpand}
        accent="secondary"
        aria-label={t`Open ${inboxItem.title} in side panel`}
        onClick={onOpenInSidePanel}
        size="small"
      />
    </StyledButtons>
  );
};
