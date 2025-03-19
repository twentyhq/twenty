import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from '@ui/display';
import { Fragment } from 'react/jsx-runtime';
import { isDefined } from 'twenty-shared';

const StyledChip = styled.button<{
  withText: boolean;
  maxWidth?: string;
  onClick?: () => void;
}>`
  all: unset;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(6)};
  /* If the chip has text, we add extra padding to have a more balanced design */
  padding: 0
    ${({ theme, withText }) => (withText ? theme.spacing(2) : theme.spacing(1))};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: ${({ onClick }) => (isDefined(onClick) ? 'pointer' : 'default')};

  &:hover {
    background: ${({ onClick, theme }) =>
      isDefined(onClick)
        ? theme.background.transparent.medium
        : theme.background.transparent.light};
  }
  max-width: ${({ maxWidth }) => maxWidth};
`;

const StyledIconsContainer = styled.div`
  align-items: center;
  display: flex;
`;

export type CommandMenuContextChipProps = {
  Icons: React.ReactNode[];
  text?: string;
  onClick?: () => void;
  testId?: string;
  maxWidth?: string;
};

export const CommandMenuContextChip = ({
  Icons,
  text,
  onClick,
  testId,
  maxWidth,
}: CommandMenuContextChipProps) => {
  return (
    <StyledChip
      withText={isNonEmptyString(text)}
      onClick={onClick}
      data-testid={testId}
      maxWidth={maxWidth}
    >
      <StyledIconsContainer>
        {Icons.map((Icon, index) => (
          <Fragment key={index}>{Icon}</Fragment>
        ))}
      </StyledIconsContainer>
      {text && <OverflowingTextWithTooltip text={text} />}
    </StyledChip>
  );
};
