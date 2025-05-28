import React from 'react';
import { useRecoilValue } from 'recoil';

import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { UserContext } from '@/users/contexts/UserContext';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const dateTimeFormat = useRecoilValue(dateTimeFormatState);

  return (
    <UserContext.Provider
      value={{
        dateFormat: dateTimeFormat.dateFormat,
        timeFormat: dateTimeFormat.timeFormat,
        timeZone: dateTimeFormat.timeZone,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
