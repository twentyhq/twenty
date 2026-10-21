import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { NavigationButton } from '@/ui/input/components/NavigationButton';

export const SettingsBillingLimitsEmptyState = () => {
  const { t } = useLingui();

  return (
    <EmptyState.Root>
      <AnimatedPlaceholder type="noRecord" />
      <EmptyState.Content>
        <EmptyState.Title>{t`No limits yet`}</EmptyState.Title>
        <EmptyState.Description>
          {t`Cap spend on AI, workflows, emails and more, workspace-wide or per member, API key or app.`}
        </EmptyState.Description>
      </EmptyState.Content>
      <NavigationButton
        to={getSettingsPath(SettingsPath.BillingNewLimit)}
        startIcon={<IconPlus />}
        variant="outline"
      >{t`New limit`}</NavigationButton>
    </EmptyState.Root>
  );
};
