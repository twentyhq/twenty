import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { PageCommandLinkEffect } from '@/command-menu-item/page-command/components/PageCommandLinkEffect';
import { SettingsBillingLimitsContent } from '@/settings/billing/components/SettingsBillingLimitsContent';
import { SettingsBillingPageLayout } from '@/settings/billing/components/SettingsBillingPageLayout';
import { EngineComponentKey } from '~/generated-metadata/graphql';

export const SettingsBillingLimits = () => {
  return (
    <SettingsBillingPageLayout
      pageCommands={
        <PageCommandLinkEffect
          engineComponentKey={EngineComponentKey.CREATE_BILLING_LIMIT}
          to={getSettingsPath(SettingsPath.BillingNewLimit)}
        />
      }
    >
      <SettingsBillingLimitsContent />
    </SettingsBillingPageLayout>
  );
};
