import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';

import { SettingsBillingLimitsContent } from '@/settings/billing/components/SettingsBillingLimitsContent';
import { SettingsBillingPageLayout } from '@/settings/billing/components/SettingsBillingPageLayout';

export const SettingsBillingLimits = () => {
  const { t } = useLingui();

  return (
    <SettingsBillingPageLayout
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.BillingNewLimit)}>
          <Button
            Icon={IconPlus}
            title={t`New limit`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
    >
      <SettingsBillingLimitsContent />
    </SettingsBillingPageLayout>
  );
};
