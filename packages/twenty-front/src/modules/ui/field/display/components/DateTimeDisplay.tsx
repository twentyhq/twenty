import format from 'date-fns-tz/format';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { parseDate } from '~/utils/date-utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: Date | string | null | undefined;
};

export const DateTimeDisplay = ({ value }: DateTimeDisplayProps) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const formatDatetime = (date: Date | string) => {
    return format(
      parseDate(date).toJSDate(),
      `${currentWorkspaceMember?.dateFormat} ${currentWorkspaceMember?.timeFormat}`,
      {
        timeZone: currentWorkspaceMember?.timeZone,
      },
    );
  };
  return <EllipsisDisplay>{value && formatDatetime(value)}</EllipsisDisplay>;
};
