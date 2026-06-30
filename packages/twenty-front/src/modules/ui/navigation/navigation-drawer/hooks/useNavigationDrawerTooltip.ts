import { useMemo } from 'react';
import { slugify } from 'transliteration';

export const useNavigationDrawerTooltip = (label: string, to?: string) => {
  const navigationItemId = useMemo(() => {
    const slugifiedLabel = slugify(label);
    const slugifiedRoute = to ? `-${slugify(to)}` : '';
    const baseId = `nav-item-${slugifiedLabel}${slugifiedRoute}`;
    return baseId.length > 50 ? baseId.substring(0, 50) : baseId;
  }, [label, to]);

  return { navigationItemId };
};
