import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { SidePanelSearchRecordItem } from '@/side-panel/pages/search/components/SidePanelSearchRecordItem';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';
import { type Ref } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

type SidePanelSearchRecordObjectSectionProps = {
  objectNameSingular: string;
  searchResultItems: SearchResultItem[];
  previewedItemId?: string;
  previewAnchorRef: Ref<HTMLDivElement>;
};

export const SidePanelSearchRecordObjectSection = ({
  objectNameSingular,
  searchResultItems,
  previewedItemId,
  previewAnchorRef,
}: SidePanelSearchRecordObjectSectionProps) => {
  const theme = useTheme();
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  return (
    <CommandMenuItemSectionGroup
      heading={capitalize(objectMetadataItem.labelPlural)}
      context={{
        icon: (
          <ObjectMetadataIcon
            objectMetadataItem={objectMetadataItem}
            size={theme.icon.size.md}
          />
        ),
      }}
    >
      {searchResultItems.map((item) => (
        <SidePanelSearchRecordItem
          key={item.id}
          item={item}
          shouldDisplayObjectLabel={false}
          anchorRef={previewedItemId === item.id ? previewAnchorRef : undefined}
        />
      ))}
    </CommandMenuItemSectionGroup>
  );
};
