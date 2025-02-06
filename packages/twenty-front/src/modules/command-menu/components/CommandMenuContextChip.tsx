import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react/jsx-runtime';
import { isDefined } from 'twenty-shared';

const StyledChip = styled.button<{
  withText: boolean;
  onClick?: () => void;
}>`
  align-items: center;
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
};

export const CommandMenuContextChip = ({
  Icons,
  text,
  onClick,
  testId,
}: CommandMenuContextChipProps) => {
  return (
    <StyledChip
      withText={isNonEmptyString(text)}
      onClick={onClick}
      data-testid={testId}
    >
      <StyledIconsContainer>
        {Icons.map((Icon, index) => (
          <Fragment key={index}>{Icon}</Fragment>
        ))}
      </StyledIconsContainer>
      {text && <span>{text}</span>}
    </StyledChip>
  );
};
