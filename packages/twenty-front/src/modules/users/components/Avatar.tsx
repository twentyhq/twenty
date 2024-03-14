import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';

import { Nullable } from '~/types/Nullable';
import { stringToHslColor } from '~/utils/string-to-hsl';

import { getImageAbsoluteURIOrBase64 } from '../utils/getProfilePictureAbsoluteURI';

export type AvatarType = 'squared' | 'rounded';

export type AvatarSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export type AvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  size?: AvatarSize;
  placeholder: string | undefined;
  entityId?: string;
  type?: Nullable<AvatarType>;
  color?: string;
  backgroundColor?: string;
  onClick?: () => void;
};

const propertiesBySize = {
  xl: {
    fontSize: '16px',
    width: '40px',
  },
  lg: {
    fontSize: '13px',
    width: '24px',
  },
  md: {
    fontSize: '12px',
    width: '16px',
  },
  sm: {
    fontSize: '10px',
    width: '14px',
  },
  xs: {
    fontSize: '8px',
    width: '12px',
  },
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
  font-size: ${({ size = 'md' }) => propertiesBySize[size].fontSize};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  height: ${({ size = 'md' }) => propertiesBySize[size].width};
  justify-content: center;
  width: ${({ size = 'md' }) => propertiesBySize[size].width};

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
    if (isNonEmptyString(avatarUrl)) {
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
