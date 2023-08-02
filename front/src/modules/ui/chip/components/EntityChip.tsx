import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarType } from '@/users/components/Avatar';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { Chip, ChipSize, ChipVariant } from './Chip';

type OwnProps = {
  linkToEntity?: string;
  entityId: string;
  name: string;
  size?: ChipSize;
  avatarSize?: number;
  pictureUrl?: string;
  avatarType?: AvatarType;
  variant?: EntityChipVariant;
};

export enum EntityChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

export function EntityChip({
  linkToEntity,
  entityId,
  name,
  size,
  avatarSize = 14,
  pictureUrl,
  avatarType = 'rounded',
  variant = EntityChipVariant.Regular,
}: OwnProps) {
  const navigate = useNavigate();

  function handleLinkClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (linkToEntity) {
      navigate(linkToEntity);
    }
  }

  return isNonEmptyString(name) ? (
    <div onClick={handleLinkClick}>
      <Chip
        label={name}
        size={size}
        variant={
          linkToEntity
            ? variant === EntityChipVariant.Regular
              ? ChipVariant.Highlighted
              : ChipVariant.Regular
            : ChipVariant.Transparent
        }
        leftComponent={
          <Avatar
            avatarUrl={pictureUrl}
            colorId={entityId}
            placeholder={name}
            size={avatarSize}
            type={avatarType}
          />
        }
      />
    </div>
  ) : (
    <></>
  );
}
