import { OnboardingImportPreviewCompanies } from '@/onboarding/components/import-contacts/OnboardingImportPreviewCompanies';
import { OnboardingImportPreviewEmails } from '@/onboarding/components/import-contacts/OnboardingImportPreviewEmails';
import { OnboardingImportPreviewSyncBadge } from '@/onboarding/components/import-contacts/OnboardingImportPreviewSyncBadge';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const PREVIEW_WIDTH = 340;
const PREVIEW_HEIGHT = 200;

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-sizing: border-box;
  overflow: hidden;
  width: ${PREVIEW_WIDTH}px;
`;

const StyledColumns = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
  display: flex;
  gap: 1px;
  height: ${PREVIEW_HEIGHT}px;
  position: relative;
`;

export const OnboardingImportPreview = () => (
  <StyledCard>
    <StyledColumns>
      <OnboardingImportPreviewEmails />
      <OnboardingImportPreviewCompanies />
      <OnboardingImportPreviewSyncBadge />
    </StyledColumns>
  </StyledCard>
);
