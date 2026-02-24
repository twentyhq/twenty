import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';

export const fieldMetadataItemUsedInDropdownComponentSelector =
  createComponentSelectorV2<FieldMetadataItem | null | undefined>({
    key: 'fieldMetadataItemUsedInDropdownComponentSelector',
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        const fieldMetadataItemIdUsedInDropdown = get(
          fieldMetadataItemIdUsedInDropdownComponentState,
          componentStateKey,
        );

        const objectMetadataItems = get(objectMetadataItemsState);

        const correspondingFieldMetadataItem = objectMetadataItems
          .flatMap((objectMetadataItem) => objectMetadataItem.fields)
          .find(
            (fieldMetadataItem) =>
              fieldMetadataItem.id === fieldMetadataItemIdUsedInDropdown,
          );

        return correspondingFieldMetadataItem;
      },
  });
