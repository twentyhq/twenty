import styled from '@emotion/styled';

export const StyledTag = styled.h3<{
  colorHexCode?: string;
  colorId?: string;
}>`
  align-items: center;
  background: ${({ colorId, theme }) =>
    colorId ? theme.tag.background[colorId] : null};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ colorHexCode, colorId, theme }) =>
    colorId ? theme.tag.text[colorId] : colorHexCode};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

type OwnProps = {
  color?: string;
  text: string;
  onClick?: () => void;
};

export function Tag({ color, text, onClick }: OwnProps) {
  const colorHexCode = color?.charAt(0) === '#' ? color : undefined;
  const colorId = color?.charAt(0) === '#' ? undefined : color;

  return (
    <StyledTag colorHexCode={colorHexCode} colorId={colorId} onClick={onClick}>
      {text}
    </StyledTag>
  );
}
