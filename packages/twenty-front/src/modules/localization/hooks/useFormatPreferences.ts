import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from '@/localization/constants/CalendarStartDay';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import {
  workspaceMemberFormatPreferencesState,
  type WorkspaceMemberFormatPreferences,
} from '@/localization/states/workspaceMemberFormatPreferencesState';
import { detectCalendarStartDay } from '@/localization/utils/detectCalendarStartDay';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import {
  getFormatPreferencesFromWorkspaceMember,
  getWorkspaceMemberUpdateFromFormatPreferences,
} from '@/localization/utils/formatPreferencesConverter';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { logError } from '~/utils/logError';

export type FormatPreferenceKey = keyof WorkspaceMemberFormatPreferences;

export const useFormatPreferences = () => {
  const [
    workspaceMemberFormatPreferences,
    setWorkspaceMemberFormatPreferences,
  ] = useRecoilState(workspaceMemberFormatPreferencesState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const updateFormatPreference = useCallback(
    async <K extends FormatPreferenceKey>(
      key: K,
      value: WorkspaceMemberFormatPreferences[K],
    ) => {
      if (!currentWorkspaceMember?.id) {
        logError('User is not logged in');
        return;
      }

      // Handle system values by detecting the actual format
      let resolvedValue = value;
      if (value === 'SYSTEM' || value === 'system' || value === 7) {
        switch (key) {
          case 'timeZone':
            resolvedValue =
              detectTimeZone() as WorkspaceMemberFormatPreferences[K];
            break;
          case 'dateFormat':
            resolvedValue = DateFormat[
              detectDateFormat()
            ] as WorkspaceMemberFormatPreferences[K];
            break;
          case 'timeFormat':
            resolvedValue = TimeFormat[
              detectTimeFormat()
            ] as WorkspaceMemberFormatPreferences[K];
            break;
          case 'numberFormat':
            resolvedValue = NumberFormat[
              detectNumberFormat()
            ] as WorkspaceMemberFormatPreferences[K];
            break;
          case 'calendarStartDay':
            resolvedValue = CalendarStartDay[
              detectCalendarStartDay()
            ] as WorkspaceMemberFormatPreferences[K];
            break;
        }
      }

      setWorkspaceMemberFormatPreferences(
        (prev: WorkspaceMemberFormatPreferences) => ({
          ...prev,
          [key]: resolvedValue,
        }),
      );

      const workspaceMemberUpdate =
        getWorkspaceMemberUpdateFromFormatPreferences({
          [key]: value, // Use original value (including SYSTEM) for backend
        });

      try {
        await updateOneRecord({
          idToUpdate: currentWorkspaceMember.id,
          updateOneRecordInput: workspaceMemberUpdate,
        });
      } catch (error) {
        logError(error);
        throw error;
      }
    },
    [
      currentWorkspaceMember,
      updateOneRecord,
      setWorkspaceMemberFormatPreferences,
    ],
  );

  const updateMultipleFormatPreferences = useCallback(
    async (updates: Partial<WorkspaceMemberFormatPreferences>) => {
      if (!currentWorkspaceMember?.id) {
        logError('User is not logged in');
        return;
      }

      const resolvedUpdates = { ...updates };
      Object.entries(updates).forEach(([key, value]) => {
        if (value === 'SYSTEM' || value === 'system' || value === 7) {
          switch (key) {
            case 'timeZone':
              resolvedUpdates.timeZone = detectTimeZone();
              break;
            case 'dateFormat':
              resolvedUpdates.dateFormat = DateFormat[detectDateFormat()];
              break;
            case 'timeFormat':
              resolvedUpdates.timeFormat = TimeFormat[detectTimeFormat()];
              break;
            case 'numberFormat':
              resolvedUpdates.numberFormat = NumberFormat[detectNumberFormat()];
              break;
            case 'calendarStartDay':
              resolvedUpdates.calendarStartDay =
                CalendarStartDay[detectCalendarStartDay()];
              break;
          }
        }
      });

      setWorkspaceMemberFormatPreferences((prev) => ({
        ...prev,
        ...resolvedUpdates,
      }));

      const workspaceMemberUpdate =
        getWorkspaceMemberUpdateFromFormatPreferences(updates);

      try {
        await updateOneRecord({
          idToUpdate: currentWorkspaceMember.id,
          updateOneRecordInput: workspaceMemberUpdate,
        });
      } catch (error) {
        logError(error);
        throw error;
      }
    },
    [
      currentWorkspaceMember,
      updateOneRecord,
      setWorkspaceMemberFormatPreferences,
    ],
  );

  const initializeFormatPreferences = useCallback(
    (workspaceMember: typeof currentWorkspaceMember) => {
      if (!workspaceMember) return;

      const preferences =
        getFormatPreferencesFromWorkspaceMember(workspaceMember);
      setWorkspaceMemberFormatPreferences(preferences);
    },
    [setWorkspaceMemberFormatPreferences],
  );

  return {
    formatPreferences: workspaceMemberFormatPreferences,
    updateFormatPreference,
    updateMultipleFormatPreferences,
    initializeFormatPreferences,
  };
};
