import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { SidePanelSearchRecordItem } from '@/side-panel/pages/search/components/SidePanelSearchRecordItem';
import { type SearchResultItemGroup } from '@/side-panel/pages/search/types/SearchResultItemGroup';
import { type Ref } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

type SidePanelSearchRecordObjectSectionProps = {
  searchResultItemGroup: SearchResultItemGroup;
  previewedItemId?: string;
  previewAnchorRef: Ref<HTMLDivElement>;
};

export const SidePanelSearchRecordObjectSection = ({
  searchResultItemGroup,
  previewedItemId,
  previewAnchorRef,
}: SidePanelSearchRecordObjectSectionProps) => {
  const theme = useTheme();

  return (
    <CommandMenuItemSectionGroup
      heading={capitalize(searchResultItemGroup.objectLabelPlural)}
      context={{
        icon: (
          <ObjectMetadataIcon
            objectMetadataItem={searchResultItemGroup.objectMetadataItem}
            size={theme.icon.size.md}
          />
        ),
      }}
    >
      {searchResultItemGroup.searchResultItems.map((item) => (
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
