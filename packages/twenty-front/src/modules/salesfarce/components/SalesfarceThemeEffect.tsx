import { useLayoutEffect } from 'react';

import { SALESFARCE_CLASS_NAME } from '@/salesfarce/constants/SalesfarceClassName';

type SalesfarceThemeEffectProps = {
  isActive: boolean;
};

export const SalesfarceThemeEffect = ({
  isActive,
}: SalesfarceThemeEffectProps) => {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle(SALESFARCE_CLASS_NAME, isActive);
  }, [isActive]);

  return null;
};
