import { OnboardingImportPreviewCompanies } from '@/onboarding/components/import-contacts/OnboardingImportPreviewCompanies';
import { OnboardingImportPreviewEmails } from '@/onboarding/components/import-contacts/OnboardingImportPreviewEmails';
import { OnboardingImportPreviewSyncBadge } from '@/onboarding/components/import-contacts/OnboardingImportPreviewSyncBadge';
import { OnboardingImportPrivacyNote } from '@/onboarding/components/import-contacts/OnboardingImportPrivacyNote';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const PREVIEW_HEIGHT = 198;

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

const StyledColumns = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
  display: flex;
  gap: 1px;
  height: ${PREVIEW_HEIGHT}px;
  position: relative;
  width: 100%;
`;

type OnboardingImportPreviewProps = {
  privacyNote: string;
};

export const OnboardingImportPreview = ({
  privacyNote,
}: OnboardingImportPreviewProps) => (
  <StyledCard>
    <StyledColumns>
      <OnboardingImportPreviewEmails />
      <OnboardingImportPreviewCompanies />
      <OnboardingImportPreviewSyncBadge />
    </StyledColumns>
    <OnboardingImportPrivacyNote text={privacyNote} />
  </StyledCard>
);
