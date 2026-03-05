import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconX } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChip = styled.div<{ deletable: boolean; danger: boolean }>`
  background-color: ${({ danger }) =>
    danger ? themeCssVariables.color.red3 : themeCssVariables.color.blue3};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ danger }) =>
    danger ? themeCssVariables.color.red5 : themeCssVariables.color.blue5};
  border-radius: 4px;
  height: 20px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  flex-direction: row;
  flex-shrink: 0;
  column-gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  user-select: none;
  white-space: nowrap;

  cursor: ${({ deletable }) => (deletable ? 'pointer' : 'default')};
  padding-right: ${({ deletable }) =>
    deletable ? '0' : themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span<{ danger: boolean }>`
  color: ${({ danger }) =>
    danger ? themeCssVariables.color.red : themeCssVariables.color.blue};
  line-height: 140%;
`;

const StyledDelete = styled.button<{ danger: boolean }>`
  box-sizing: border-box;
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  user-select: none;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  color: ${({ danger }) =>
    danger ? themeCssVariables.color.red : themeCssVariables.color.blue};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};

  &:hover {
    background-color: ${({ danger }) =>
      danger ? themeCssVariables.color.red5 : themeCssVariables.color.blue5};
  }
`;

type BaseChipProps = {
  label: string;
  title?: string;
  onRemove?: () => void;
  removeAriaLabel?: string;
  danger?: boolean;
  leftIcon?: React.ReactNode;
};

export const BaseChip = ({
  label,
  title,
  onRemove,
  removeAriaLabel = 'Remove',
  danger = false,
  leftIcon,
}: BaseChipProps) => {
  const { theme } = useContext(ThemeContext);
  const isDeletable = onRemove !== undefined;

  return (
    <StyledChip deletable={isDeletable} danger={danger}>
      {leftIcon}
      <StyledLabel title={title ?? label} danger={danger}>
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
