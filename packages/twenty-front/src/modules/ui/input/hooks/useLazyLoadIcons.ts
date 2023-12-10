import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { iconsState } from '@/ui/input/states/iconsState';

export const useLazyLoadIcons = () => {
  const [icons, setIcons] = useRecoilState(iconsState);
  const [isLoadingIcons, setIsLoadingIcons] = useState(true);

  useEffect(() => {
    import('../constants/icons').then((lazyLoadedIcons) => {
      setIcons(lazyLoadedIcons);
      setIsLoadingIcons(false);
    });
  }, [setIcons]);

  return { icons, isLoadingIcons };
};
