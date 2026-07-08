import { styled } from '@linaria/react';
import { type MouseEvent, type ReactNode, useContext } from 'react';
import { IconX } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChip = styled.div<{
  danger: boolean;
  selected: boolean;
}>`
  align-items: center;
  background-color: ${({ danger, selected }) =>
    selected
      ? danger
        ? themeCssVariables.color.red
        : themeCssVariables.color.blue
      : danger
        ? themeCssVariables.color.red3
        : themeCssVariables.color.blue3};
  border-color: ${({ danger, selected }) =>
    selected
      ? danger
        ? themeCssVariables.color.red
        : themeCssVariables.color.blue
      : danger
        ? themeCssVariables.color.red5
        : themeCssVariables.color.blue5};
  border-radius: ${themeCssVariables.border.radius.smRound};
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
  column-gap: ${themeCssVariables.spacing[1]};
  corner-shape: round;
  cursor: pointer;
  display: inline-flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 20px;
  max-width: 100%;
  padding-left: ${themeCssVariables.spacing[1]};
  user-select: none;
  white-space: nowrap;

  @keyframes email-recipient-chip-flash {
    0%,
    100% {
      background-color: ${themeCssVariables.color.blue3};
    }
    50% {
      background-color: ${themeCssVariables.color.blue5};
    }
  }

  &[data-flashing='true'] {
    animation: email-recipient-chip-flash 300ms ease-in-out 2;
  }
`;

const StyledLabel = styled.span<{ danger: boolean; selected: boolean }>`
  color: ${({ danger, selected }) =>
    selected
      ? themeCssVariables.font.color.inverted
      : danger
        ? themeCssVariables.color.red
        : themeCssVariables.color.blue};
  line-height: 140%;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledDelete = styled.button<{ danger: boolean; selected: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-bottom-right-radius: ${themeCssVariables.border.radius.smRound};
  border-top-right-radius: ${themeCssVariables.border.radius.smRound};
  box-sizing: border-box;
  color: ${({ danger, selected }) =>
    selected
      ? themeCssVariables.font.color.inverted
      : danger
        ? themeCssVariables.color.red
        : themeCssVariables.color.blue};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: 20px;
  justify-content: center;
  margin: 0;
  padding: 0;
  user-select: none;
  width: 20px;

  &:hover {
    background-color: ${({ danger }) =>
      danger ? themeCssVariables.color.red5 : themeCssVariables.color.blue5};
  }
`;

type EmailRecipientChipProps = {
  chipId: string;
  label: string;
  title: string;
  leftComponent?: ReactNode;
  danger?: boolean;
  selected?: boolean;
  isFlashing?: boolean;
  onFlashEnd?: () => void;
  onDoubleClick?: () => void;
  onRemove: (event: MouseEvent) => void;
  removeAriaLabel: string;
};

export const EmailRecipientChip = ({
  chipId,
  label,
  title,
  leftComponent,
  danger = false,
  selected = false,
  isFlashing = false,
  onFlashEnd,
  onDoubleClick,
  onRemove,
  removeAriaLabel,
}: EmailRecipientChipProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledChip
      id={chipId}
      role="option"
      aria-selected={selected}
      danger={danger}
      selected={selected}
      data-flashing={isFlashing}
      onAnimationEnd={onFlashEnd}
      onDoubleClick={onDoubleClick}
      title={title}
    >
      {leftComponent}
      <StyledLabel danger={danger} selected={selected}>
        {label}
      </StyledLabel>
      <StyledDelete
        type="button"
        onClick={onRemove}
        aria-label={removeAriaLabel}
        danger={danger}
        selected={selected}
      >
        <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      </StyledDelete>
    </StyledChip>
  );
};
