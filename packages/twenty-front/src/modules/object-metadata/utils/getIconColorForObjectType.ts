import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { getIconTileColorShades } from 'twenty-ui/components/data-display';

export const getIconColorForObjectType = (objectType: string): string => {
  switch (objectType) {
    case 'note':
    case 'task':
      return getIconTileColorShades(
        getObjectColorWithFallback({
          nameSingular: objectType,
          color: null,
          isSystem: false,
        }),
      ).iconColor;
    default:
      return 'currentColor';
  }
};
