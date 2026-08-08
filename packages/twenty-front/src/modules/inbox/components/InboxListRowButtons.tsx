import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { type InboxItem, InboxItemStatus } from '~/generated/graphql';

const StyledButtons = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

// The row is itself a button, so anything nested has to stop the click from
// also opening the item.
const StyledStopPropagation = styled.div`
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
  const { executeInboxItemAction } = useInboxItemActions();

  const inlineActions =
    inboxItem.status === InboxItemStatus.OPEN
      ? inboxItem.inboxItemType.actions.filter(
          (action) =>
            isDefined(action.transitionKind) && action.inputSchema.length === 0,
        )
      : [];

  return (
    <StyledButtons>
      <StyledStopPropagation
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {inlineActions.map((action) => (
          <Button
            key={action.key}
            onClick={() =>
              void executeInboxItemAction({
                inboxItemId: inboxItem.id,
                actionKey: action.key,
                expectedVersion: inboxItem.version,
              })
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
      </StyledStopPropagation>
    </StyledButtons>
  );
};
