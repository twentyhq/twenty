import { type PropsWithChildren } from 'react';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { UserContext } from '@/users/contexts/UserContext';

type UserContextProviderProps = PropsWithChildren;

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();

  return (
    <UserContext.Provider value={{ dateFormat, timeFormat, timeZone }}>
      {children}
    </UserContext.Provider>
  );
};
