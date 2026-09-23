import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { CommandMenuItemSectionContextChip } from '@/command-menu-item/display/components/CommandMenuItemSectionContextChip';
import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';

export const CommandMenuItemObjectContextChip = () => {
  const { theme } = useContext(ThemeContext);
  const { objectMetadataItem } = useContextStoreObjectMetadataItem();

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <CommandMenuItemSectionContextChip
      startElement={
        <ObjectMetadataIcon
          objectMetadataItem={objectMetadataItem}
          size={theme.icon.size.sm}
        />
      }
      label={capitalize(objectMetadataItem.labelPlural)}
    />
  );
};
