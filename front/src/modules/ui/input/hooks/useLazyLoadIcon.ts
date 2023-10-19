import { useEffect, useState } from 'react';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export const useLazyLoadIcon = (iconKey: string) => {
  const [Icon, setIcon] = useState<IconComponent | undefined>();
  const [isLoadingIcon, setIsLoadingIcon] = useState(true);

  useEffect(() => {
    if (!iconKey) return;

    import(`@tabler/icons-react/dist/esm/icons/${iconKey}.js`).then(
      (lazyLoadedIcon) => {
        setIcon(lazyLoadedIcon.default);
        setIsLoadingIcon(false);
      },
    );
  }, [iconKey]);

  return { Icon, isLoadingIcon };
};
