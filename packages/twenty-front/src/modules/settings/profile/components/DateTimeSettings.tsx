import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { DateTimeSettingsDateFormatSelect } from '@/settings/profile/components/DateTimeSettingsDateFormatSelect';
import { DateTimeSettingsTimeFormatSelect } from '@/settings/profile/components/DateTimeSettingsTimeFormatSelect';
import { DateTimeSettingsTimeZoneSelect } from '@/settings/profile/components/DateTimeSettingsTimeZoneSelect';
import { dateTimeFormatState } from '@/workspace-member/states/dateTimeFormatState';
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
  const [dateTimeFormat, setDateTimeFormat] =
    useRecoilState(dateTimeFormatState);
  const [timeZone, setTimeZone] = useState(dateTimeFormat.timeZone);
  const [dateFormat, setDateFormat] = useState(dateTimeFormat.dateFormat);
  const [timeFormat, setTimeFormat] = useState(dateTimeFormat.timeFormat);

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
    const dateTimeFormatStateFields: any = {};

    if (timeZone !== dateTimeFormat.timeZone) {
      changedWorkspaceMemberFields.timeZone = timeZone;
      dateTimeFormatStateFields.timeZone = timeZone;
    }
    if (dateFormat !== dateTimeFormat.dateFormat) {
      changedWorkspaceMemberFields.dateFormat =
        getWorkspaceEnumFromDateFormat(dateFormat);
      dateTimeFormatStateFields.dateFormat = dateFormat;
    }
    if (timeFormat !== dateTimeFormat.timeFormat) {
      changedWorkspaceMemberFields.timeFormat =
        getWorkspaceEnumFromTimeFormat(timeFormat);
      dateTimeFormatStateFields.timeFormat = timeFormat;
    }

    if (!isEmptyObject(changedWorkspaceMemberFields)) {
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        ...dateTimeFormatStateFields,
      });

      setDateTimeFormat({
        ...dateTimeFormatStateFields,
      });

      updateWorkspaceMember(changedWorkspaceMemberFields);
    }
  }, [
    currentWorkspaceMember,
    dateTimeFormat,
    timeZone,
    dateFormat,
    timeFormat,
    updateWorkspaceMember,
    setCurrentWorkspaceMember,
    setDateTimeFormat,
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
