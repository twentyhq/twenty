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

// The sandbox lacks PointerEvent, which base-ui's switch requires.
const StyledSwitch = styled.button`
  background: ${() => themeCssVariables.background.transparent.medium};
  border: 0;
  border-radius: ${() => themeCssVariables.border.radius.pill};
  corner-shape: round;
  cursor: pointer;
  flex-shrink: 0;
  height: ${() => themeCssVariables.spacing[5]};
  padding: ${() => themeCssVariables.spacing[0.5]};
  width: ${() => themeCssVariables.spacing[8]};

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
    height: ${() => themeCssVariables.spacing[4]};
    width: ${() => themeCssVariables.spacing[4]};
  }

  &[aria-checked='true']::after {
    transform: translateX(${() => themeCssVariables.spacing[3]});
  }
`;

type FeatureSettingsSectionProps = {
  title: string;
  label: string;
  description: string;
  isAvailable: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  hasLoadError: boolean;
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
  isLoading,
  hasLoadError,
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
          disabled={!isAvailable || isLoading || hasLoadError || isSaving}
          onClick={() => onChange(!isEnabled)}
        />
      </StyledControl>
      {!isAvailable && (
        <p id={availabilityId}>{t('Not available in this version yet.')}</p>
      )}
      {hasLoadError && (
        <p role="alert">
          {t('Could not refresh this setting. Retrying automatically.')}
        </p>
      )}
      {hasSaveError && (
        <p role="alert">
          {t('Could not save this setting. Please try again.')}
        </p>
      )}
    </StyledSection>
  );
};
