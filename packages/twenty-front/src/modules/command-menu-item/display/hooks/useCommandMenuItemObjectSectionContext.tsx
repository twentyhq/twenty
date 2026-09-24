import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';

export const useCommandMenuItemObjectSectionContext = ():
  | CommandMenuItemSectionContext
  | undefined => {
  const { theme } = useContext(ThemeContext);
  const { objectMetadataItem } = useContextStoreObjectMetadataItem();

  if (!isDefined(objectMetadataItem)) {
    return undefined;
  }

  return {
    icon: (
      <ObjectMetadataIcon
        objectMetadataItem={objectMetadataItem}
        size={theme.icon.size.md}
      />
    ),
    label: capitalize(objectMetadataItem.labelPlural),
  };
};
