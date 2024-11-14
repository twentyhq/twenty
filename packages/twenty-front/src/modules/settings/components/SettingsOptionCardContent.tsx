import { SettingsCounter } from '@/settings/components/SettingsCounter';
import { Select } from '@/ui/input/components/Select';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useId } from 'react';
import { CardContent, IconComponent, Toggle } from 'twenty-ui';

type BaseSettingsOptionCardContentProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description?: string;
  divider?: boolean;
  disabled?: boolean;
  advancedMode?: boolean;
};

type ToggleProps = {
  variant: 'toggle';
  checked: boolean;
  onChange: (checked: boolean) => void;
};

type CounterProps = {
  variant: 'counter';
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  exampleValue: number;
};

type SelectProps<Value> = {
  variant: 'select';
  value: Value;
  onChange: (value: Value) => void;
  options: {
    value: Value;
    label: string;
    Icon?: IconComponent;
  }[];
  selectClassName?: string;
  dropdownId: string;
  fullWidth?: boolean;
};

type SettingsOptionCardContentProps<Value = any> =
  BaseSettingsOptionCardContentProps &
    (ToggleProps | CounterProps | SelectProps<Value>);

const StyledCardContent = styled(CardContent)<{
  disabled: boolean;
  isToggleVariant: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  cursor: ${({ disabled, isToggleVariant }) =>
    isToggleVariant ? (disabled ? 'default' : 'pointer') : 'default'};
  position: ${({ isToggleVariant }) =>
    isToggleVariant ? 'relative' : 'static'};
  pointer-events: ${({ disabled, isToggleVariant }) =>
    isToggleVariant ? (disabled ? 'none' : 'auto') : 'auto'};

  &:hover {
    background: ${({ theme, isToggleVariant }) =>
      isToggleVariant ? theme.background.transparent.lighter : 'none'};
  }
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledIcon = styled.div`
  align-items: center;
  border: 2px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(8)};
  min-width: ${({ theme }) => theme.icon.size.md};
`;

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

const StyledSelect = styled(Select)`
  margin-left: auto;
  width: 120px;
`;

const StyledCover = styled.span`
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

export const SettingsOptionCardContent = (
  props: SettingsOptionCardContentProps,
) => {
  const theme = useTheme();
  const toggleId = useId();
  const {
    Icon,
    title,
    description,
    divider,
    disabled = false,
    advancedMode = false,
  } = props;

  const renderControl = () => {
    if (props.variant === 'toggle') {
      return (
        <StyledToggle
          id={toggleId}
          value={props.checked}
          onChange={props.onChange}
          disabled={disabled}
          color={advancedMode ? theme.color.yellow : theme.color.blue}
        />
      );
    }

    if (props.variant === 'select') {
      return (
        <StyledSelect
          className={props.selectClassName}
          dropdownWidth={props.fullWidth ? 'auto' : 120}
          disabled={disabled}
          dropdownId={props.dropdownId}
          value={props.value}
          onChange={props.onChange}
          options={props.options}
          variant="small"
        />
      );
    }

    return (
      <SettingsCounter
        value={props.value}
        onChange={props.onChange}
        minValue={props.minValue}
        maxValue={props.maxValue}
      />
    );
  };

  const getDescription = () => {
    if (props.variant === 'counter') {
      return `Example: ${props.exampleValue.toFixed(props.value)}`;
    }
    return description;
  };

  return (
    <StyledCardContent
      divider={divider}
      disabled={disabled}
      isToggleVariant={props.variant === 'toggle'}
    >
      {Icon && (
        <StyledIcon>
          <Icon size={theme.icon.size.xl} stroke={theme.icon.stroke.lg} />
        </StyledIcon>
      )}

      <div>
        <StyledTitle>
          <label htmlFor={toggleId}>
            {title}
            {props.variant === 'toggle' && <StyledCover />}
          </label>
        </StyledTitle>
        <StyledDescription>{getDescription()}</StyledDescription>
      </div>

      {renderControl()}
    </StyledCardContent>
  );
};
