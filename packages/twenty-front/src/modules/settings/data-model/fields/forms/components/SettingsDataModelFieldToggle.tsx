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
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledGroup = styled.div`
  align-items: center;
  display: flex;
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
  const infoCircleElementId = `info-circle-id-${+new Date()}`;

  return (
    <StyledContainer>
      <StyledGroup>
        {Icon && <Icon />}
        {label}
      </StyledGroup>
      <StyledGroup>
        {tooltip && (
          <IconInfoCircle id={infoCircleElementId} size={theme.icon.size.md} />
        )}
        {tooltip &&
          createPortal(
            <AppTooltip
              anchorSelect={`#${infoCircleElementId}`}
              content={tooltip}
              offset={5}
              isOpen
              noArrow
              place="bottom"
              positionStrategy="absolute"
              delay={TooltipDelay.mediumDelay}
            >
              <pre>{tooltip}</pre>
            </AppTooltip>,
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
