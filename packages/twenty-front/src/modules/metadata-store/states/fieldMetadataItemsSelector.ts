import { getFieldIconOrTypeDefault, isDefined } from 'twenty-shared/utils';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { registeredIconNamesState } from '@/ui/icon/states/registeredIconNamesState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const fieldMetadataItemsSelector = createAtomSelector<
  FlatFieldMetadataItem[]
>({
  key: 'fieldMetadataItemsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'fieldMetadataItems');
    const registeredIconNames = get(registeredIconNamesState);

    return (storeItem.current as FlatFieldMetadataItem[]).map(
      (fieldMetadataItem) => {
        const icon = getFieldIconOrTypeDefault({
          icon:
            isDefined(registeredIconNames) &&
            !registeredIconNames.has(fieldMetadataItem.icon ?? '')
              ? null
              : fieldMetadataItem.icon,
          type: fieldMetadataItem.type,
        });

        return icon === fieldMetadataItem.icon
          ? fieldMetadataItem
          : { ...fieldMetadataItem, icon };
      },
    );
  },
});
