import { Toggle } from '@/ui/input/components/Toggle';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import {
  AppTooltip,
  IconComponent,
  IconInfoCircle,
  TooltipDelay,
} from 'twenty-ui';

const StyledContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.tertiary : theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

interface SettingsDataModelFieldToggleProps {
  disabled?: boolean;
  Icon?: IconComponent;
  label: string;
  tooltip?: string;
  value?: boolean;
  onChange: (value: boolean) => void;
}

export const SettingsDataModelFieldToggle = ({
  disabled,
  Icon,
  label,
  tooltip,
  value,
  onChange,
}: SettingsDataModelFieldToggleProps) => {
  const theme = useTheme();
  const infoCircleElementId = `info-circle-id-${Math.random().toString(36).slice(2)}`;

  return (
    <StyledContainer>
      <StyledGroup>
        {Icon && (
          <Icon color={theme.font.color.tertiary} size={theme.icon.size.md} />
        )}
        {label}
      </StyledGroup>
      <StyledGroup>
        {tooltip && (
          <IconInfoCircle
            id={infoCircleElementId}
            size={theme.icon.size.md}
            color={theme.font.color.tertiary}
          />
        )}
        {tooltip &&
          createPortal(
            <AppTooltip
              anchorSelect={`#${infoCircleElementId}`}
              content={tooltip}
              offset={5}
              noArrow
              place="bottom"
              positionStrategy="absolute"
              delay={TooltipDelay.shortDelay}
            />,
            document.body,
          )}
        <Toggle
          disabled={disabled}
          value={value}
          onChange={onChange}
          toggleSize="small"
        />
      </StyledGroup>
    </StyledContainer>
  );
};
