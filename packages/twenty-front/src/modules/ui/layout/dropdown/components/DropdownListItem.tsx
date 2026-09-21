import { isString } from '@sniptt/guards';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ListItem, type ListItemProps } from 'twenty-ui/primitives/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';

type DropdownListItemProps = ListItemProps;

export const DropdownListItem = ({
  onClick,
  children,
  ...props
}: DropdownListItemProps) => {
  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <ListItem
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onClick={isDefined(onClick) ? handleRowClick : undefined}
    >
      {isString(children) ? (
        <OverflowingTextWithTooltip text={children} />
      ) : (
        children
      )}
    </ListItem>
  );
};
