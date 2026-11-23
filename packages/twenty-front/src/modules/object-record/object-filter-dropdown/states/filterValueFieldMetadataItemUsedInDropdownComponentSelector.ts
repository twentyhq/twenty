import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isDefined } from 'twenty-shared/utils';

export const filterValueFieldMetadataItemUsedInDropdownComponentSelector =
  createAtomComponentSelector<FieldMetadataItem | null | undefined>({
    key: 'filterValueFieldMetadataItemUsedInDropdownComponentSelector',
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        const relationTargetFieldMetadataId = get(
          relationTargetFieldMetadataIdUsedInDropdownComponentState,
          componentStateKey,
        );

        if (!isDefined(relationTargetFieldMetadataId)) {
          return get(
            fieldMetadataItemUsedInDropdownComponentSelector,
            componentStateKey,
          );
        }

        // The target field may have been deleted since the filter was saved
        return getFieldMetadataItemById({
          fieldMetadataId: relationTargetFieldMetadataId,
          objectMetadataItems: get(objectMetadataItemsSelector),
        }).fieldMetadataItem;
      },
  });
