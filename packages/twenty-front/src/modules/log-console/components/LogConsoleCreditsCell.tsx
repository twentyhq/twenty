import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';

type LogConsoleCreditsCellProps = {
  creditsUsedMicro: number;
};

export const LogConsoleCreditsCell = ({
  creditsUsedMicro,
}: LogConsoleCreditsCellProps) => {
  const { formatUsageValue } = useUsageValueFormatter();

  return (
    <SettingsTableTextCell
      align="right"
      text={formatUsageValue(
        creditsUsedMicro / INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
      )}
    />
  );
};
