import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconX } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChip = styled.div<{ deletable: boolean; danger: boolean }>`
  align-items: center;
  background-color: ${({ danger }) =>
    danger ? themeCssVariables.color.red3 : themeCssVariables.color.blue3};
  border-color: ${({ danger }) =>
    danger ? themeCssVariables.color.red5 : themeCssVariables.color.blue5};
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;
  column-gap: ${themeCssVariables.spacing[1]};
  cursor: ${({ deletable }) => (deletable ? 'pointer' : 'default')};
  display: inline-flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 20px;
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${({ deletable }) =>
    deletable ? '0' : themeCssVariables.spacing[1]};

  user-select: none;
  white-space: nowrap;
`;

const StyledLabel = styled.span<{ danger: boolean }>`
  color: ${({ danger }) =>
    danger ? themeCssVariables.color.red : themeCssVariables.color.blue};
  line-height: 140%;
`;

const StyledDelete = styled.button<{ danger: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${({ danger }) =>
    danger ? themeCssVariables.color.red : themeCssVariables.color.blue};
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
