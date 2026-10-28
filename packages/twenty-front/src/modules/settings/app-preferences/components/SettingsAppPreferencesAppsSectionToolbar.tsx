import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

type SettingsAppPreferencesAppsSectionToolbarProps = {
  isLoading: boolean;
  hasLoadError: boolean;
  onRetry: () => void;
};

export const SettingsAppPreferencesAppsSectionToolbar = ({
  isLoading,
  hasLoadError,
  onRetry,
}: SettingsAppPreferencesAppsSectionToolbarProps) => {
  const { t } = useLingui();

  if (isLoading) {
    return <SettingsSectionSkeletonLoader />;
  }

  if (!hasLoadError) {
    return null;
  }

  return (
    <StyledToolbar>
      <SettingsApplicationLoadErrorBanner
        message={t`Your installed apps could not be loaded. Check your connection and try again.`}
        onRetry={onRetry}
      />
    </StyledToolbar>
  );
};
