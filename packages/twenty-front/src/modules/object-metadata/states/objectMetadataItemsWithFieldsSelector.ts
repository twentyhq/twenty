import { fieldMetadataItemsSelector } from '@/metadata-store/states/fieldMetadataItemsSelector';
import { indexMetadataItemsSelector } from '@/metadata-store/states/indexMetadataItemsSelector';
import { flatObjectMetadataItemsSelector } from '@/object-metadata/states/flatObjectMetadataItemsSelector';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getPermittedFields } from '@/object-metadata/utils/getPermittedFields';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const objectMetadataItemsWithFieldsSelector = createAtomSelector<
  EnrichedObjectMetadataItem[]
>({
  key: 'objectMetadataItemsWithFieldsSelector',
  get: ({ get }) => {
    const flatObjects = get(flatObjectMetadataItemsSelector);
    const allFlatFields = get(fieldMetadataItemsSelector);
    const allFlatIndexes = get(indexMetadataItemsSelector);
    const objectPermissionsByObjectMetadataId = get(
      objectPermissionsByObjectMetadataIdSelector,
    );

    const fieldsByObjectId = new Map<
      string,
      (typeof allFlatFields)[number][]
    >();

    for (const field of allFlatFields) {
      const existing = fieldsByObjectId.get(field.objectMetadataId);

      if (isDefined(existing)) {
        existing.push(field);
      } else {
        fieldsByObjectId.set(field.objectMetadataId, [field]);
      }
    }

    const indexesByObjectId = new Map<
      string,
      (typeof allFlatIndexes)[number][]
    >();

    for (const index of allFlatIndexes) {
      const existing = indexesByObjectId.get(index.objectMetadataId);

      if (isDefined(existing)) {
        existing.push(index);
      } else {
        indexesByObjectId.set(index.objectMetadataId, [index]);
      }
    }

    return flatObjects.map((flatObject) => {
      const fields = fieldsByObjectId.get(flatObject.id) ?? [];
      const indexMetadatas = indexesByObjectId.get(flatObject.id) ?? [];

      return {
        ...flatObject,
        fields,
        indexMetadatas,
        searchFieldMetadatas: flatObject.searchFieldMetadatas ?? [],
        ...getPermittedFields({
          fields,
          objectPermissions: getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            flatObject.id,
          ),
        }),
      } satisfies EnrichedObjectMetadataItem;
    });
  },
});
