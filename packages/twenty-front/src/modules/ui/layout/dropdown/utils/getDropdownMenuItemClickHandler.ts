import { type MouseEventHandler } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const getDropdownMenuItemClickHandler = (
  onClick: MouseEventHandler<HTMLDivElement> | undefined,
): MouseEventHandler<HTMLDivElement> | undefined => {
  if (!isDefined(onClick)) {
    return undefined;
  }

  return (event) => {
    event.preventDefault();
    event.stopPropagation();

    onClick(event);
  };
};
