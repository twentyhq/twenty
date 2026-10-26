import { GettingStartedPageContent } from '@/getting-started/components/GettingStartedPageContent';
import { GettingStartedSnoozeMenu } from '@/getting-started/components/GettingStartedSnoozeMenu';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconCreditCard, IconRocket } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const GettingStartedPage = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isGettingStartedEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_GETTING_STARTED_ENABLED,
  );
  const { canKeepPlan, keepPlanLabel } = useGettingStartedTrial();

  if (!isGettingStartedEnabled) {
    return <Navigate to={AppPath.Index} replace />;
  }

  return (
    <>
      <PageTitle title={t`Getting started`} />
      <PageCardLayout
        header={
          <PageCardHeader
            icon={<IconRocket size={theme.icon.size.md} />}
            title={t`Getting started`}
            actionButton={
              <>
                {canKeepPlan && (
                  <NavigationButton
                    size="sm"
                    startIcon={<IconCreditCard />}
                    to={getSettingsPath(SettingsPath.Billing)}
                  >
                    {keepPlanLabel}
                  </NavigationButton>
                )}
                <GettingStartedSnoozeMenu />
              </>
            }
          />
        }
      >
        <GettingStartedPageContent />
      </PageCardLayout>
    </>
  );
};
