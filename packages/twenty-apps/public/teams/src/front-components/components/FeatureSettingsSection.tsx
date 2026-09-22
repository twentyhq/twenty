import styled from '@emotion/styled';
import { useId } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSection = styled.section`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
`;

const StyledTitle = styled.h2`
  font-size: ${() => themeCssVariables.font.size.lg};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin: 0 0 ${() => themeCssVariables.spacing[2]};
`;

const StyledDescription = styled.p`
  color: ${() => themeCssVariables.font.color.secondary};
  font-size: ${() => themeCssVariables.font.size.md};
  line-height: ${() => themeCssVariables.text.lineHeight.lg};
  margin: 0 0 ${() => themeCssVariables.spacing[3]};
`;

const StyledControl = styled.div`
  align-items: center;
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: flex;
  font-size: ${() => themeCssVariables.font.size.md};
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: space-between;
  padding: ${() => themeCssVariables.spacing[4]};
`;

// The front component sandbox does not provide the PointerEvent used by the
// base-ui switch, so this control uses a native button.
const StyledSwitch = styled.button`
  background: ${() => themeCssVariables.background.transparent.medium};
  border: 0;
  border-radius: 999px;
  corner-shape: round;
  cursor: pointer;
  flex-shrink: 0;
  height: 20px;
  padding: 2px;
  width: 32px;

  &[aria-checked='true'] {
    background: ${() => themeCssVariables.color.blue};
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &::after {
    background: ${() => themeCssVariables.background.primary};
    border-radius: 50%;
    corner-shape: round;
    content: '';
    display: block;
    height: 16px;
    width: 16px;
  }

  &[aria-checked='true']::after {
    transform: translateX(12px);
  }
`;

type FeatureSettingsSectionProps = {
  title: string;
  label: string;
  description: string;
  isAvailable: boolean;
  isEnabled: boolean;
  isSaving: boolean;
  hasSaveError: boolean;
  onChange: (isEnabled: boolean) => void;
};

export const FeatureSettingsSection = ({
  title,
  label,
  description,
  isAvailable,
  isEnabled,
  isSaving,
  hasSaveError,
  onChange,
}: FeatureSettingsSectionProps) => {
  const { t } = useTranslate();
  const controlId = useId();
  const titleId = useId();
  const availabilityId = useId();

  return (
    <StyledSection aria-labelledby={titleId}>
      <StyledTitle id={titleId}>{title}</StyledTitle>
      <StyledDescription>{description}</StyledDescription>
      <StyledControl>
        <label htmlFor={controlId}>{label}</label>
        <StyledSwitch
          id={controlId}
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-describedby={!isAvailable ? availabilityId : undefined}
          disabled={!isAvailable || isSaving}
          onClick={() => onChange(!isEnabled)}
        />
      </StyledControl>
      {!isAvailable && (
        <p id={availabilityId}>{t('Not available in this version yet.')}</p>
      )}
      {hasSaveError && (
        <p role="alert">
          {t('Could not save this setting. Please try again.')}
        </p>
      )}
    </StyledSection>
  );
};
