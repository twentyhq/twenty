import { useEffect, useState } from 'react';

import { cookieStorage } from '~/infrastructure/cookie-storage';

export function useIsLogged(): boolean {
  const [value, setValue] = useState<string | undefined>(
    cookieStorage.getItem('accessToken'),
  );

  useEffect(() => {
    const updateValue = (newValue: string | undefined) => setValue(newValue);

    cookieStorage.addEventListener('accessToken', updateValue);

    return () => {
      cookieStorage.removeEventListener('accessToken', updateValue);
    };
  }, []);

  return !!value;
}
