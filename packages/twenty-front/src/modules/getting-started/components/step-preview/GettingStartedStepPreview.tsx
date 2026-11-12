import { OnboardingImportPrivacyNote } from '@/onboarding/components/import-contacts/OnboardingImportPrivacyNote';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const PREVIEW_SCENE_HEIGHT = 198;

const StyledCard = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow: hidden;
  padding-bottom: calc(${themeCssVariables.spacing[3]} - 1px);
  width: 100%;
`;

const StyledScene = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  height: ${PREVIEW_SCENE_HEIGHT}px;
  overflow: hidden;
  position: relative;
  width: 100%;

  &[data-dotted] {
    background-image: radial-gradient(
      circle,
      ${themeCssVariables.border.color.medium} 1px,
      transparent 1px
    );
    background-position: 9px 9px;
    background-size: 18px 18px;
  }
`;

type GettingStartedStepPreviewProps = {
  note: string;
  NoteIcon: IconComponent;
  isDotted?: boolean;
  children: ReactNode;
};

export const GettingStartedStepPreview = ({
  note,
  NoteIcon,
  isDotted = false,
  children,
}: GettingStartedStepPreviewProps) => (
  <StyledCard>
    <StyledScene aria-hidden data-dotted={isDotted || undefined}>
      {children}
    </StyledScene>
    <OnboardingImportPrivacyNote text={note} Icon={NoteIcon} />
  </StyledCard>
);
