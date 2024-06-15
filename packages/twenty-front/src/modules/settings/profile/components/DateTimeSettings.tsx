import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { DateTimeSettingsDateFormatSelect } from '@/settings/profile/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/profile/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/profile/components/DateTimeSettingsTimeZoneSelect';
import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';
import { getWorkspaceEnumFromDateFormat } from '@/workspace-member/utils/formatDateLabel';
import { getWorkspaceEnumFromTimeFormat } from '@/workspace-member/utils/formatTimeLabel';
import { isDefined } from '~/utils/isDefined';
import { isEmptyObject } from '~/utils/isEmptyObject';
import { logError } from '~/utils/logError';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const DateTimeSettings = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const [timeZone, setTimeZone] = useState(
    currentWorkspaceMember?.timeZone ?? detectTimeZone(),
  );
  const [dateFormat, setDateFormat] = useState(
    (currentWorkspaceMember?.dateFormat as DateFormat) ??
      DateFormat.MONTH_FIRST,
  );
  const [timeFormat, setTimeFormat] = useState(
    (currentWorkspaceMember?.timeFormat as TimeFormat) ?? TimeFormat.MILITARY,
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const updateWorkspaceMember = useCallback(
    async (changedFields: any) => {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      try {
        await updateOneRecord({
          idToUpdate: currentWorkspaceMember.id,
          updateOneRecordInput: changedFields,
        });
      } catch (error) {
        logError(error);
      }
    },
    [currentWorkspaceMember, updateOneRecord],
  );

  useEffect(() => {
    if (!isDefined(currentWorkspaceMember)) {
      return;
    }
    const changedWorkspaceMemberFields: any = {};
    const workspaceMemberStateFields: any = {};

    if (timeZone !== currentWorkspaceMember.timeZone) {
      changedWorkspaceMemberFields.timeZone = timeZone;
      workspaceMemberStateFields.timeZone = timeZone;
    }
    if (dateFormat !== currentWorkspaceMember.dateFormat) {
      changedWorkspaceMemberFields.dateFormat =
        getWorkspaceEnumFromDateFormat(dateFormat);
      workspaceMemberStateFields.dateFormat = dateFormat;
    }
    if (timeFormat !== currentWorkspaceMember.timeFormat) {
      changedWorkspaceMemberFields.timeFormat =
        getWorkspaceEnumFromTimeFormat(timeFormat);
      workspaceMemberStateFields.timeFormat = timeFormat;
    }

    if (!isEmptyObject(changedWorkspaceMemberFields)) {
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        ...workspaceMemberStateFields,
      });

      updateWorkspaceMember(changedWorkspaceMemberFields);
    }
  }, [
    currentWorkspaceMember,
    timeZone,
    dateFormat,
    timeFormat,
    updateWorkspaceMember,
    setCurrentWorkspaceMember,
  ]);

  if (!isDefined(currentWorkspaceMember)) return;

  return (
    <StyledContainer>
      <DateTimeSettingsTimeZoneSelect value={timeZone} onChange={setTimeZone} />
      <DateTimeSettingsDateFormatSelect
        value={dateFormat}
        onChange={setDateFormat}
        timeZone={timeZone}
      />
      <DateTimeSettingsTimeFormatSelect
        value={timeFormat}
        onChange={setTimeFormat}
        timeZone={timeZone}
      />
    </StyledContainer>
  );
};
