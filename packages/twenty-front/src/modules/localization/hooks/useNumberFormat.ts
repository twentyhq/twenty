import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import {
  formatNumber as utilFormatNumber,
  type FormatNumberOptions,
} from '~/utils/format/formatNumber';

export const useNumberFormat = () => {
  const workspaceMemberFormatPreferences = useRecoilValue(
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
