import { styled } from '@linaria/react';
import { type MouseEvent, type ReactNode, useContext } from 'react';
import { IconX } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChip = styled.div<{
  deletable: boolean;
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
  color: ${({ danger, selected }) =>
    selected
      ? themeCssVariables.font.color.inverted
      : danger
        ? themeCssVariables.color.red
        : themeCssVariables.color.blue};
  column-gap: ${themeCssVariables.spacing[1]};
  corner-shape: round;
  cursor: ${({ deletable }) => (deletable ? 'pointer' : 'default')};
  display: inline-flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 20px;
  max-width: 100%;
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${({ deletable }) =>
    deletable ? '0' : themeCssVariables.spacing[1]};

  user-select: none;
  white-space: nowrap;

  @keyframes base-chip-flash {
    0%,
    100% {
      filter: none;
    }
    50% {
      filter: brightness(0.85);
    }
  }

  &[data-flashing='true'] {
    animation: base-chip-flash 300ms ease-in-out 2;
  }
`;

const StyledLabel = styled.span<{ maxWidth?: number }>`
  line-height: 140%;
  max-width: ${({ maxWidth }) =>
    maxWidth === undefined ? 'none' : `${maxWidth}px`};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledDelete = styled.button<{ danger: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-bottom-right-radius: ${themeCssVariables.border.radius.smRound};
  border-top-right-radius: ${themeCssVariables.border.radius.smRound};
  box-sizing: border-box;
  color: inherit;
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

type BaseChipProps = {
  chipId?: string;
  label: string;
  title?: string;
  onRemove?: (event: MouseEvent) => void;
  removeAriaLabel?: string;
  danger?: boolean;
  selected?: boolean;
  isFlashing?: boolean;
  onDoubleClick?: () => void;
  maxWidth?: number;
  leftIcon?: ReactNode;
};

export const BaseChip = ({
  chipId,
  label,
  title,
  onRemove,
  removeAriaLabel = 'Remove',
  danger = false,
  selected = false,
  isFlashing = false,
  onDoubleClick,
  maxWidth,
  leftIcon,
}: BaseChipProps) => {
  const { theme } = useContext(ThemeContext);
  const isDeletable = onRemove !== undefined;

  return (
    <StyledChip
      id={chipId}
      deletable={isDeletable}
      danger={danger}
      selected={selected}
      data-flashing={isFlashing}
      onDoubleClick={onDoubleClick}
    >
      {leftIcon}
      <StyledLabel title={title ?? label} maxWidth={maxWidth}>
        {label}
      </StyledLabel>

      {isDeletable && (
        <StyledDelete
          type="button"
          onClick={onRemove}
          aria-label={removeAriaLabel}
          danger={danger}
        >
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      )}
    </StyledChip>
  );
};
