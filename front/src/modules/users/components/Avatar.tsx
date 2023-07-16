import styled from '@emotion/styled';

import { stringToHslColor } from '@/utils/string-to-hsl';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

import { getImageAbsoluteURIOrBase64 } from '../utils/getProfilePictureAbsoluteURI';

export type AvatarType = 'squared' | 'rounded';

type OwnProps = {
  avatarUrl: string | null | undefined;
  size: number;
  placeholder: string;
  colorId?: string;
  type?: AvatarType;
};

export const StyledAvatar = styled.div<OwnProps & { colorId: string }>`
  align-items: center;
  background-color: ${({ avatarUrl, colorId }) =>
    !isNonEmptyString(avatarUrl) ? stringToHslColor(colorId, 75, 85) : 'none'};
  ${({ avatarUrl }) =>
    isNonEmptyString(avatarUrl) ? `background-image: url(${avatarUrl});` : ''}
  background-size: cover;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  color: ${({ colorId }) => stringToHslColor(colorId, 75, 25)};
  display: flex;

  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  height: ${(props) => props.size}px;
  justify-content: center;
  width: ${(props) => props.size}px;
`;

export function Avatar({
  avatarUrl,
  size,
  placeholder,
  colorId = placeholder,
  type = 'squared',
}: OwnProps) {
  const noAvatarUrl = !isNonEmptyString(avatarUrl);

  return (
    <StyledAvatar
      avatarUrl={getImageAbsoluteURIOrBase64(avatarUrl)}
      placeholder={placeholder}
      size={size}
      type={type}
      colorId={colorId}
    >
      {noAvatarUrl && placeholder[0]?.toLocaleUpperCase()}
    </StyledAvatar>
  );
}
