import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { IconChevronLeft } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsWizardStepBarProps = {
  stepNumber: number;
  label: string;
  onBack?: () => void;
  trailing?: ReactNode;
};

const StyledRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  height: 100%;
  width: 100%;
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

const StyledCenter = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

const StyledRight = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

export const SettingsWizardStepBar = ({
  stepNumber,
  label,
  onBack,
  trailing,
}: SettingsWizardStepBarProps) => (
  <StyledRow>
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
    <StyledCenter>
      <span>{stepNumber}.</span>
      <span>{label}</span>
    </StyledCenter>
    <StyledRight>{trailing}</StyledRight>
  </StyledRow>
);
