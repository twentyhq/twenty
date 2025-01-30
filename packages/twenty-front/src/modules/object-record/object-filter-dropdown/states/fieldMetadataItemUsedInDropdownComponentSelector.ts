import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const fieldMetadataItemUsedInDropdownComponentSelector =
  createComponentSelectorV2<FieldMetadataItem | null>({
    key: 'fieldMetadataItemUsedInDropdownComponentSelector',
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const fieldMetadataItemIdUsedInDropdown = get(
          fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
            instanceId,
          }),
        );

        const objectMetadataItems = get(objectMetadataItemsState);

        const correspondingObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.fields.some(
              (fieldMetadataItemToFind) =>
                fieldMetadataItemToFind.id ===
                fieldMetadataItemIdUsedInDropdown,
            ),
        );

        if (!correspondingObjectMetadataItem) {
          return null;
        }

        const foundFieldMetadataItem =
          correspondingObjectMetadataItem.fields.find(
            (fieldMetadataItemToFind) =>
              fieldMetadataItemToFind.id === fieldMetadataItemIdUsedInDropdown,
          );

        return foundFieldMetadataItem ?? null;
      },
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
