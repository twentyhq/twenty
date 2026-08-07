import { isNonEmptyString } from '@sniptt/guards';
import { useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { type InboxItemAction } from '~/generated/graphql';

type InboxItemDetailCardActionButtonProps = {
  action: InboxItemAction;
  onClick?: () => void;
  to?: string;
};

export const InboxItemDetailCardActionButton = ({
  action,
  onClick,
  to,
}: InboxItemDetailCardActionButtonProps) => {
  const { getIcon } = useIcons();

  const ActionIcon = isNonEmptyString(action.icon)
    ? getIcon(action.icon)
    : undefined;

  return (
    <Button
      Icon={ActionIcon}
      accent={action.isPrimary ? 'blue' : 'default'}
      onClick={onClick}
      size="small"
      title={action.label}
      to={to}
      variant={action.isPrimary ? 'primary' : 'secondary'}
    />
  );
};
