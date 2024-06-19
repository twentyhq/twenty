import { useState } from 'react';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';
import { parseDate } from '~/utils/date-utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
};

export const DateTimeDisplay = ({ value }: DateTimeDisplayProps) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [timeZone] = useState(
    currentWorkspaceMember?.timeZone ?? detectTimeZone(),
  );
  const [dateFormat] = useState(
    (currentWorkspaceMember?.dateFormat as DateFormat) ??
      DateFormat.MONTH_FIRST,
  );
  const [timeFormat] = useState(
    (currentWorkspaceMember?.timeFormat as TimeFormat) ?? TimeFormat.MILITARY,
  );

  const formatDatetime = (date: Date | string) => {
    return formatInTimeZone(
      parseDate(date).toJSDate(),
      timeZone,
      `${dateFormat} ${timeFormat}`,
    );
  };
  return <EllipsisDisplay>{value && formatDatetime(value)}</EllipsisDisplay>;
};
