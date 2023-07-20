import styled from '@emotion/styled';

export const StyledTag = styled.h3<{
  colorHexCode?: string;
  colorName?: string;
}>`
  align-items: center;
  background: ${({ colorName, theme }) =>
    colorName ? theme.tag.background[colorName] : null};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ colorHexCode, colorName, theme }) =>
    colorName ? theme.tag.text[colorName] : colorHexCode};
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
  colorCode?: string;
  text: string;
  onClick?: () => void;
};

export function Tag({ colorCode, text, onClick }: OwnProps) {
  const colorHexCode = colorCode?.charAt(0) === '#' ? colorCode : undefined;
  const colorName = colorCode?.charAt(0) === '#' ? undefined : colorCode;

  return (
    <StyledTag
      colorHexCode={colorHexCode}
      colorName={colorName}
      onClick={onClick}
    >
      {text}
    </StyledTag>
  );
}
