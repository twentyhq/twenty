import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import {
  workspaceMemberFormatPreferencesState,
  type WorkspaceMemberFormatPreferences,
} from '@/localization/states/workspaceMemberFormatPreferencesState';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { detectNumberFormat } from '@/localization/utils/detection/detectNumberFormat';
import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { getFormatPreferencesFromWorkspaceMember } from '@/localization/utils/format-preferences/getFormatPreferencesFromWorkspaceMember';
import { getWorkspaceMemberUpdateFromFormatPreferences } from '@/localization/utils/format-preferences/getWorkspaceMemberUpdateFromFormatPreferences';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { CalendarStartDay } from 'twenty-shared/constants';
import { logError } from '~/utils/logError';

export type FormatPreferenceKey = keyof WorkspaceMemberFormatPreferences;

export const useFormatPreferences = () => {
  const [
    workspaceMemberFormatPreferences,
    setWorkspaceMemberFormatPreferences,
  ] = useRecoilState(workspaceMemberFormatPreferencesState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

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
      // This is dirty and will need to be unified
      if (
        value === 'SYSTEM' ||
        value === 'system' ||
        value === CalendarStartDay.SYSTEM
      ) {
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

        // Update the currentWorkspaceMemberState with the new backend values
        setCurrentWorkspaceMember((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...workspaceMemberUpdate,
          };
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
      setCurrentWorkspaceMember,
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
        if (
          value === 'SYSTEM' ||
          value === 'system' ||
          value === CalendarStartDay.SYSTEM
        ) {
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

        // Update the currentWorkspaceMemberState with the new backend values
        setCurrentWorkspaceMember((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...workspaceMemberUpdate,
          };
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
      setCurrentWorkspaceMember,
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
