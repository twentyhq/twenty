import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarType } from '@/users/components/Avatar';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { Chip, ChipVariant } from './Chip';

type OwnProps = {
  linkToEntity?: string;
  entityId: string;
  name: string;
  pictureUrl?: string;
  avatarType?: AvatarType;
};

export function EntityChip({
  linkToEntity,
  entityId,
  name,
  pictureUrl,
  avatarType = 'rounded',
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
        variant={linkToEntity ? ChipVariant.Highlighted : ChipVariant.Regular}
        leftComponent={
          <Avatar
            avatarUrl={pictureUrl}
            colorId={entityId}
            placeholder={name}
            size={14}
            type={avatarType}
          />
        }
      />
    </div>
  ) : (
    <></>
  );
}
