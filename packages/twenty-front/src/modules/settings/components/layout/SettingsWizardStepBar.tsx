import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { IconChevronLeft } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsWizardStepBarProps = {
  label: ReactNode;
  onBack?: () => void;
  trailing?: ReactNode;
};

const StyledStepBar = styled.div`
  align-items: center;
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  min-width: 0;
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  min-width: 0;
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  justify-self: center;
  min-width: 0;
  text-align: center;
`;

const StyledRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  min-width: 0;
`;

export const SettingsWizardStepBar = ({
  label,
  onBack,
  trailing,
}: SettingsWizardStepBarProps) => (
  <StyledStepBar>
    <StyledLeft>
      {onBack && (
        <LightIconButton
          Icon={IconChevronLeft}
          size="small"
          accent="tertiary"
          onClick={onBack}
        />
      )}
    </StyledLeft>
    <StyledLabel>{label}</StyledLabel>
    <StyledRight>{trailing}</StyledRight>
  </StyledStepBar>
);
