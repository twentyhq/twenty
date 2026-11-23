import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

type AccountsSettingsBreadcrumbLink = BreadcrumbProps['links'][number];

export const useAccountsSettingsBreadcrumbLink =
  (): AccountsSettingsBreadcrumbLink => {
    const { t } = useLingui();

    return {
      children: t`Apps preferences`,
      href: getSettingsPath(SettingsPath.AppPreferences),
    };
  };
