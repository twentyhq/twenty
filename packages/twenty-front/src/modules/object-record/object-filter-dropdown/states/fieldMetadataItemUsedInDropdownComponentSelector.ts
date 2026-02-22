import { objectMetadataItemsRecoilBridge } from '@/object-metadata/states/objectMetadataItemsRecoilBridge';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';

export const fieldMetadataItemUsedInDropdownComponentSelector =
  createComponentSelector<FieldMetadataItem | null | undefined>({
    key: 'fieldMetadataItemUsedInDropdownComponentSelector',
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const fieldMetadataItemIdUsedInDropdown = get(
          fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
            instanceId,
          }),
        );

        const objectMetadataItems = get(objectMetadataItemsRecoilBridge);

        const correspondingFieldMetadataItem = objectMetadataItems
          .flatMap((objectMetadataItem) => objectMetadataItem.fields)
          .find(
            (fieldMetadataItem) =>
              fieldMetadataItem.id === fieldMetadataItemIdUsedInDropdown,
          );

        return correspondingFieldMetadataItem;
      },
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
