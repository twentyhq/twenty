import { useEffect, useState } from 'react';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { useLazyLoadIcons } from './useLazyLoadIcons';

export const useLazyLoadIcon = (iconKey: string) => {
  const { isLoadingIcons, icons } = useLazyLoadIcons();
  const [Icon, setIcon] = useState<IconComponent | undefined>();
  const [isLoadingIcon, setIsLoadingIcon] = useState(true);

  useEffect(() => {
    if (!iconKey) return;

    if (!isLoadingIcons) {
      setIcon(icons[iconKey]);
      setIsLoadingIcon(false);
    }
  }, [iconKey, icons, isLoadingIcons]);

  return { Icon, isLoadingIcon };
};
