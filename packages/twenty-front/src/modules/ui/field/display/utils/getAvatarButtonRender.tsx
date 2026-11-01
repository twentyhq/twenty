import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type MouseEventHandler } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type AvatarProps } from 'twenty-ui/primitives/data-display';

export const getAvatarButtonRender = ({
  name,
  onClick,
}: Pick<AvatarProps, 'name'> & {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  if (!isDefined(onClick)) {
    return undefined;
  }

  const trimmedName = name?.trim();
  const accessibleLabel = isNonEmptyString(trimmedName)
    ? trimmedName
    : t`Avatar`;

  return (
    <button type="button" aria-label={accessibleLabel} onClick={onClick} />
  );
};
