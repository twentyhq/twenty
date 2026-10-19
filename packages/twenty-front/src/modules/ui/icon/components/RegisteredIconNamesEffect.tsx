import { useEffect } from 'react';
import { isEmptyObject } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

import { registeredIconNamesState } from '@/ui/icon/states/registeredIconNamesState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const RegisteredIconNamesEffect = () => {
  const { getIcons } = useIcons();
  const icons = getIcons();
  const setRegisteredIconNames = useSetAtomState(registeredIconNamesState);

  useEffect(() => {
    if (isEmptyObject(icons)) {
      return;
    }

    setRegisteredIconNames(new Set(Object.keys(icons)));
  }, [icons, setRegisteredIconNames]);

  return null;
};
