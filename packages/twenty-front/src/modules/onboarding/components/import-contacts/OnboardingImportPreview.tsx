import { OnboardingImportPreviewCompanies } from '@/onboarding/components/import-contacts/OnboardingImportPreviewCompanies';
import { OnboardingImportPreviewEmails } from '@/onboarding/components/import-contacts/OnboardingImportPreviewEmails';
import { OnboardingImportPreviewSyncBadge } from '@/onboarding/components/import-contacts/OnboardingImportPreviewSyncBadge';
import { OnboardingImportPrivacyNote } from '@/onboarding/components/import-contacts/OnboardingImportPrivacyNote';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  max-width: 100%;
  overflow: hidden;
  padding-bottom: ${themeCssVariables.spacing[3]};
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledColumns = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
  display: flex;
  gap: 1px;
  height: ${PREVIEW_HEIGHT}px;
  position: relative;
  width: 100%;
`;

export const OnboardingImportPreview = () => (
  <StyledCard>
    <StyledColumns>
      <OnboardingImportPreviewEmails />
      <OnboardingImportPreviewCompanies />
      <OnboardingImportPreviewSyncBadge />
    </StyledColumns>
    <OnboardingImportPrivacyNote />
  </StyledCard>
);
