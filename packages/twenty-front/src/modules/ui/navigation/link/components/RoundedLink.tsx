import { MouseEvent, useContext } from 'react';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { FONT_COMMON, THEME_COMMON, ThemeContext } from 'twenty-ui';

type RoundedLinkProps = {
  href: string;
  label?: string;
  maxWidth?: number;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const fontSizeMd = FONT_COMMON.size.md;
const spacingHalf = THEME_COMMON.spacing(0.5);
const spacing1 = THEME_COMMON.spacing(1);
const spacing2 = THEME_COMMON.spacing(2);

const spacingMultiplicator = THEME_COMMON.spacingMultiplicator;

const StyledLink = styled.a<{
  color: string;
  background: string;
  backgroundHover: string;
  backgroundActive: string;
  border: string;
  maxWidth: number | undefined;
}>`
  align-items: center;
  background-color: ${({ background }) => background};
  border: 1px solid ${({ border }) => border};

  border-radius: 50px;
  color: ${({ color }) => color};

  cursor: pointer;
  display: inline-block;
  font-weight: ${fontSizeMd};

  gap: ${spacing1};

  justify-content: left;

  max-width: calc(${({ maxWidth }) => (maxWidth ? maxWidth + "px": "100%" )} - 2*${spacing2});

  overflow: hidden;
  padding: ${spacingHalf} ${spacing2};

  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${({ backgroundHover }) => backgroundHover};
  }

  &:active {
    background-color: ${({ backgroundActive }) => backgroundActive};
  }
`;

export const RoundedLink = ({ label, href, maxWidth, onClick }: RoundedLinkProps) => {
  const { theme } = useContext(ThemeContext);

  const background = theme.background.transparent.lighter;
  const backgroundHover = theme.background.transparent.light;
  const backgroundActive = theme.background.transparent.medium;
  const border = theme.border.color.strong;
  const color = theme.font.color.primary;

  if (!isNonEmptyString(label)) {
    return <></>;
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledLink
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      color={color}
      background={background}
      backgroundHover={backgroundHover}
      backgroundActive={backgroundActive}
      border={border}
      maxWidth={maxWidth}
    >
      {label}
    </StyledLink>
  );
};
