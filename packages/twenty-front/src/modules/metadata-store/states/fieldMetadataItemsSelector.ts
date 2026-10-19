import { isNonEmptyString } from '@sniptt/guards';
import { FIELD_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

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
      (fieldMetadataItem) =>
        isNonEmptyString(fieldMetadataItem.icon) &&
        (!isDefined(registeredIconNames) ||
          registeredIconNames.has(fieldMetadataItem.icon))
          ? fieldMetadataItem
          : {
              ...fieldMetadataItem,
              icon: FIELD_TYPE_DEFAULT_ICONS[fieldMetadataItem.type],
            },
    );
  },
});
