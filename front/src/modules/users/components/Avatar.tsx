import styled from '@emotion/styled';

import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';

type OwnProps = {
  avatarUrl: string | null | undefined;
  size: number;
  placeholderLetter: string;
  type?: 'squared' | 'rounded';
};

export const StyledAvatar = styled.div<Omit<OwnProps, 'placeholderLetter'>>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: ${(props) => (props.type === 'rounded' ? '50%' : '2px')};
  background-image: url(${(props) =>
    isNonEmptyString(props.avatarUrl) ? props.avatarUrl : 'none'});
  background-color: ${(props) =>
    !isNonEmptyString(props.avatarUrl)
      ? props.theme.tertiaryBackground
      : 'none'};
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;

  display: flex;
  align-items: center;

  justify-content: center;
`;

type StyledPlaceholderLetterProps = {
  size: number;
};

export const StyledPlaceholderLetter = styled.div<StyledPlaceholderLetterProps>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;

  font-size: 12px;
  font-weight: 500;

  display: flex;
  align-items: center;
  justify-content: center;

  color: ${(props) => props.theme.text80};
`;

export function Avatar({
  avatarUrl,
  size,
  placeholderLetter,
  type = 'squared',
}: OwnProps) {
  const noAvatarUrl = !isNonEmptyString(avatarUrl);

  return (
    <StyledAvatar avatarUrl={avatarUrl} size={size} type={type}>
      {noAvatarUrl && (
        <StyledPlaceholderLetter size={size}>
          {placeholderLetter}
        </StyledPlaceholderLetter>
      )}
    </StyledAvatar>
  );
}
