import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Avatar, AvatarType } from '@/users/components/Avatar';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { IconComment } from '../../icon';

import { Chip, ChipVariant } from './Chip';

type EntityChipProps = {
  linkToEntity?: string;
  entityId: string;
  name: string;
  pictureUrl?: string;
  commentsCount?: number;
  avatarType?: AvatarType;
  variant?: EntityChipVariant;
  LeftIcon?: IconComponent;
};

export enum EntityChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

const StyledCommentIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledChip = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const EntityChip = ({
  linkToEntity,
  entityId,
  name,
  pictureUrl,
  commentsCount = 0,
  avatarType = 'rounded',
  variant = EntityChipVariant.Regular,
  LeftIcon,
}: EntityChipProps) => {
  const navigate = useNavigate();

  const theme = useTheme();

  const handleLinkClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (linkToEntity) {
      event.preventDefault();
      event.stopPropagation();
      navigate(linkToEntity);
    }
  };

  return isNonEmptyString(name) ? (
    <StyledChip onClick={handleLinkClick}>
      <Chip
        label={name}
        variant={
          linkToEntity
            ? variant === EntityChipVariant.Regular
              ? ChipVariant.Highlighted
              : ChipVariant.Regular
            : ChipVariant.Transparent
        }
        leftComponent={
          LeftIcon ? (
            <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          ) : (
            <Avatar
              avatarUrl={pictureUrl}
              colorId={entityId}
              placeholder={name}
              size="sm"
              type={avatarType}
            />
          )
        }
      />
      {commentsCount > 0 && (
        <StyledCommentIcon>
          <IconComment size={theme.icon.size.md} />
          {commentsCount}
        </StyledCommentIcon>
      )}
    </StyledChip>
  ) : (
    <></>
  );
};
