import { useMemo } from 'react';

import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  formatNumber as utilFormatNumber,
  type FormatNumberOptions,
} from '~/utils/format/formatNumber';

export const useNumberFormat = () => {
  const workspaceMemberFormatPreferences = useAtomStateValue(
    workspaceMemberFormatPreferencesState,
  );

  const formatNumber = useMemo(
    () =>
      (
        value: number,
        options?: Omit<FormatNumberOptions, 'format'>,
      ): string => {
        return utilFormatNumber(value, {
          format: workspaceMemberFormatPreferences.numberFormat,
          ...options,
        });
      },
    [workspaceMemberFormatPreferences.numberFormat],
  );

  return {
    formatNumber,
    numberFormat: workspaceMemberFormatPreferences.numberFormat,
  };
};
