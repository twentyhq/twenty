import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { FONT_COMMON, THEME_COMMON, ThemeContext } from 'twenty-ui';

type RoundedItemProps = {
  label?: string;
};

const fontSizeMd = FONT_COMMON.size.md;
const spacing1 = THEME_COMMON.spacing(1);
const spacing2 = THEME_COMMON.spacing(2);

const spacingMultiplicator = THEME_COMMON.spacingMultiplicator;

const StyledLink = styled.a<{
  color: string;
  background: string;
  backgroundHover: string;
  backgroundActive: string;
  border: string;
}>`
  align-items: center;
  background-color: ${({ background }) => background};
  border: 1px solid ${({ border }) => border};

  border-radius: 50px;
  color: ${({ color }) => color};

  cursor: pointer;
  display: inline-flex;
  font-weight: ${fontSizeMd};

  gap: ${spacing1};

  height: 10px;
  justify-content: center;

  max-width: calc(100% - ${spacingMultiplicator} * 2px);

  min-width: fit-content;

  overflow: hidden;
  padding: ${spacing1} ${spacing2};

  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;
`;

export const RoundedItem = ({ label }: RoundedItemProps) => {
  const { theme } = useContext(ThemeContext);

  const background = theme.background.transparent.lighter;
  const backgroundHover = theme.background.transparent.light;
  const backgroundActive = theme.background.transparent.medium;
  const border = theme.border.color.strong;
  const color = theme.font.color.primary;

  if (!isNonEmptyString(label)) {
    return <></>;
  }

  return (
    <StyledLink
      color={color}
      background={background}
      backgroundHover={backgroundHover}
      backgroundActive={backgroundActive}
      border={border}
    >
      {label}
    </StyledLink>
  );
};
