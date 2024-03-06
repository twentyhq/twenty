import { useTheme } from '@emotion/react';

import { SettingsObjectFieldCurrencyFormValues } from '@/settings/data-model/components/SettingsObjectFieldCurrencyForm';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';

export type CurrencyDisplayWithIconsProps = {
  currencyValues: SettingsObjectFieldCurrencyFormValues | undefined;
};

export const CurrencyDisplayWithIcons = ({
  currencyValues,
}: CurrencyDisplayWithIconsProps) => {
  const theme = useTheme();

  const currencyCode = currencyValues?.currencyCode || 'USD';

  const currencyInfo = SETTINGS_FIELD_CURRENCY_CODES[currencyCode];

  const { Icon } = currencyInfo;

  return (
    <>
      <Icon
        color={theme.font.color.primary}
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
      />{' '}
    </>
  );
};
