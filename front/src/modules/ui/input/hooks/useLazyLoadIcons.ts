import { useEffect, useState } from 'react';

import { IconComponent } from '../../display/icon/types/IconComponent';

export const useLazyLoadIcons = () => {
  const [icons, setIcons] = useState<Record<string, IconComponent>>({});
  const [isLoadingIcons, setIsLoadingIcons] = useState(true);

  useEffect(() => {
    import('../constants/icons').then((lazyLoadedIcons) => {
      setIcons(lazyLoadedIcons);
      setIsLoadingIcons(false);
    });
  }, []);

  return { icons, isLoadingIcons };
};
