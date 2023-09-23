import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { isNonEmptyString } from '~/utils/isNonEmptyString';
import { stringToHslColor } from '~/utils/string-to-hsl';

import { getImageAbsoluteURIOrBase64 } from '../utils/getProfilePictureAbsoluteURI';

export type AvatarType = 'squared' | 'rounded';

export type AvatarSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export type AvatarProps = {
  avatarUrl: string | null | undefined;
  size?: AvatarSize;
  placeholder: string;
  colorId?: string;
  type?: AvatarType;
  onClick?: () => void;
};

const StyledAvatar = styled.div<AvatarProps & { colorId: string }>`
  align-items: center;
  background-color: ${({ avatarUrl, colorId }) =>
    !isNonEmptyString(avatarUrl) ? stringToHslColor(colorId, 75, 85) : 'none'};
  ${({ avatarUrl }) =>
    isNonEmptyString(avatarUrl) ? `background-image: url(${avatarUrl});` : ''}
  background-position: center;
  background-size: cover;
  border: ${({ onClick }) => (onClick ? '1px' : '0')};
  border-color: transparent;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  color: ${({ colorId }) => stringToHslColor(colorId, 75, 25)};
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
  transition: border ${(props) => props.theme.animation.duration.normal} ease;
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
    border-color: ${({ onClick }) =>
      onClick ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
  }
`;

export const Avatar = ({
  avatarUrl,
  size = 'md',
  placeholder,
  colorId = placeholder,
  onClick,
  type = 'squared',
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

  return (
    <StyledAvatar
      avatarUrl={getImageAbsoluteURIOrBase64(avatarUrl)}
      placeholder={placeholder}
      size={size}
      type={type}
      colorId={colorId}
      onClick={onClick}
    >
      {(noAvatarUrl || isInvalidAvatarUrl) &&
        placeholder[0]?.toLocaleUpperCase()}
    </StyledAvatar>
  );
};
