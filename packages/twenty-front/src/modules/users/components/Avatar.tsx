import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';

import { Nullable } from '~/types/Nullable';
import { stringToHslColor } from '~/utils/string-to-hsl';

import { getImageAbsoluteURIOrBase64 } from '../utils/getProfilePictureAbsoluteURI';

export type AvatarType = 'squared' | 'rounded';

export type AvatarSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export type AvatarProps = {
  avatarUrl: string | null | undefined;
  className?: string;
  size?: AvatarSize;
  placeholder: string | undefined;
  entityId?: string;
  type?: Nullable<AvatarType>;
  color?: string;
  backgroundColor?: string;
  onClick?: () => void;
};

export const StyledAvatar = styled.div<
  AvatarProps & { color: string; backgroundColor: string }
>`
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  ${({ avatarUrl }) =>
    isNonEmptyString(avatarUrl) ? `background-image: url(${avatarUrl});` : ''}
  background-position: center;
  background-size: cover;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  color: ${({ color }) => color};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;

  flex-shrink: 0;
  font-size: ${({ size }) => {
    switch (size) {
      case 'xl':
        return '16px';
      case 'lg':
        return '13px';
      case 'md':
      default:
        return '12px';
      case 'sm':
        return '10px';
      case 'xs':
        return '8px';
    }
  }};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  height: ${({ size }) => {
    switch (size) {
      case 'xl':
        return '40px';
      case 'lg':
        return '24px';
      case 'md':
      default:
        return '16px';
      case 'sm':
        return '14px';
      case 'xs':
        return '12px';
    }
  }};
  justify-content: center;
  width: ${({ size }) => {
    switch (size) {
      case 'xl':
        return '40px';
      case 'lg':
        return '24px';
      case 'md':
      default:
        return '16px';
      case 'sm':
        return '14px';
      case 'xs':
        return '12px';
    }
  }};

  &:hover {
    box-shadow: ${({ theme, onClick }) =>
      onClick ? '0 0 0 4px ' + theme.background.transparent.light : 'unset'};
  }
`;

export const Avatar = ({
  avatarUrl,
  className,
  size = 'md',
  placeholder,
  entityId = placeholder,
  onClick,
  type = 'squared',
  color,
  backgroundColor,
}: AvatarProps) => {
  const noAvatarUrl = !isNonEmptyString(avatarUrl);
  const [isInvalidAvatarUrl, setIsInvalidAvatarUrl] = useState(false);
  useEffect(() => {
    if (avatarUrl) {
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(false);
        img.onerror = () => resolve(true);
        img.src = getImageAbsoluteURIOrBase64(avatarUrl) as string;
      }).then((res) => {
        setIsInvalidAvatarUrl(res as boolean);
      });
    }
  }, [avatarUrl]);

  const fixedColor = color ?? stringToHslColor(entityId ?? '', 75, 25);
  const fixedBackgroundColor =
    backgroundColor ??
    (!isNonEmptyString(avatarUrl)
      ? stringToHslColor(entityId ?? '', 75, 85)
      : 'none');

  return (
    <StyledAvatar
      className={className}
      avatarUrl={getImageAbsoluteURIOrBase64(avatarUrl)}
      placeholder={placeholder}
      size={size}
      type={type}
      entityId={entityId}
      onClick={onClick}
      color={fixedColor}
      backgroundColor={fixedBackgroundColor}
    >
      {(noAvatarUrl || isInvalidAvatarUrl) &&
        placeholder?.[0]?.toLocaleUpperCase()}
    </StyledAvatar>
  );
};
