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
  background-color: ${(props) =>
    !isNonEmptyString(props.avatarUrl)
      ? props.theme.tertiaryBackground
      : 'none'};
  background-image: url(${(props) =>
    isNonEmptyString(props.avatarUrl) ? props.avatarUrl : 'none'});
  background-size: cover;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  color: ${(props) => props.theme.text80};
  display: flex;

  font-size: ${(props) => props.theme.fontSizeExtraSmall};
  font-weight: ${(props) => props.theme.fontWeightMedium};
  height: ${(props) => props.size}px;

  justify-content: center;
  width: ${(props) => props.size}px;
`;

export const StyledPlaceholderLetter = styled.div`
  color: ${(props) => props.theme.text80};

  font-size: ${(props) => props.theme.fontSizeExtraSmall};
  font-weight: 500;
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
