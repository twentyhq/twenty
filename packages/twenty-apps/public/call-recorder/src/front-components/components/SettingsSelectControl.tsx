import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledControlContainer = styled.div<{
  $disabled: boolean;
  $hasAdornment: boolean;
}>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.light};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${({ $disabled }) =>
    $disabled
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  display: grid;
  gap: ${() => themeCssVariables.spacing[1]};
  grid-template-columns: ${({ $hasAdornment }) =>
    $hasAdornment ? 'auto 1fr auto' : '1fr auto'};
  height: ${() => themeCssVariables.spacing[6]};
  max-width: 100%;
  padding: 0 ${() => themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledChevronWrapper = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
`;

type SettingsSelectControlProps = {
  label: string;
  adornment?: ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

export const SettingsSelectControl = ({
  label,
  adornment,
  disabled = false,
  onClick,
}: SettingsSelectControlProps) => (
  <StyledControlContainer
    $disabled={disabled}
    $hasAdornment={!isUndefined(adornment)}
    onClick={disabled ? undefined : onClick}
  >
    {adornment}
    <OverflowingTextWithTooltip text={label} />
    <StyledChevronWrapper>
      <IconChevronDown size={ICON.size.md} stroke={ICON.stroke.sm} />
    </StyledChevronWrapper>
  </StyledControlContainer>
);
