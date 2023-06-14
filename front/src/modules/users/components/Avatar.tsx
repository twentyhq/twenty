import styled from '@emotion/styled';

import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

type OwnProps = {
  avatarUrl: string | null | undefined;
  size: number;
  placeholder: string;
  type?: 'squared' | 'rounded';
};

export const StyledAvatar = styled.div<Omit<OwnProps, 'placeholder'>>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  background-image: url(${(props) =>
    isNonEmptyString(props.avatarUrl) ? props.avatarUrl : 'none'});
  background-color: ${(props) =>
    !isNonEmptyString(props.avatarUrl)
      ? props.theme.tertiaryBackground
      : 'none'};
  background-image: url(${(props) =>
    isNonEmptyString(props.avatarUrl) ? props.avatarUrl : 'none'});
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  display: flex;

  height: ${(props) => props.size}px;
  justify-content: center;

  width: ${(props) => props.size}px;
`;

type StyledPlaceholderLetterProps = {
  size: number;
};

export const StyledPlaceholderLetter = styled.div<StyledPlaceholderLetterProps>`
  align-items: center;
  color: ${(props) => props.theme.text80};

  display: flex;
  font-size: 12px;

  font-weight: 500;
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
      {noAvatarUrl && (
        <StyledPlaceholderLetter size={size}>
          {placeholder[0]?.toLocaleUpperCase()}
        </StyledPlaceholderLetter>
      )}
    </StyledAvatar>
  );
}
