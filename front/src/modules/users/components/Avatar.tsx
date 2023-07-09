import styled from '@emotion/styled';

import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

export type AvatarType = 'squared' | 'rounded';

type OwnProps = {
  avatarUrl: string | null | undefined;
  size: number;
  placeholder: string;
  type?: AvatarType;
};

export const StyledAvatar = styled.div<Omit<OwnProps, 'placeholder'>>`
  align-items: center;
  background-color: ${(props) =>
    !isNonEmptyString(props.avatarUrl)
      ? props.theme.background.tertiary
      : 'none'};
  ${(props) =>
    isNonEmptyString(props.avatarUrl)
      ? `background-image: url(${props.avatarUrl});`
      : ''}
  background-size: cover;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;

  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  height: ${(props) => props.size}px;
  justify-content: center;
  width: ${(props) => props.size}px;
`;

export function Avatar({
  avatarUrl,
  size,
  placeholder,
  type = 'squared',
}: OwnProps) {
  const noAvatarUrl = !isNonEmptyString(avatarUrl);

  return (
    <StyledAvatar avatarUrl={avatarUrl} size={size} type={type}>
      {noAvatarUrl && placeholder[0]?.toLocaleUpperCase()}
    </StyledAvatar>
  );
}
