import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getNonReadableFieldInfoForViewField } from '@/object-record/record-index/utils/getNonReadableInfoForViewField';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type NonReadableViewFieldUsage = 'filter' | 'sort';

export type NonReadableViewFieldInfo = {
  fieldLabel?: string;
  objectLabel: string;
  usage: NonReadableViewFieldUsage;
};

export const useHasCurrentViewNonReadableFields = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const nonReadableViewFieldInfo = useMemo(():
    | NonReadableViewFieldInfo
    | undefined => {
    if (!isDefined(view)) {
      return undefined;
    }

    const readableFieldIds = new Set(
      objectMetadataItem.readableFields.map((field) => field.id),
    );

    const params = {
      objectMetadataItem,
      objectMetadataItems,
      readableFieldIds,
      objectPermissionsByObjectMetadataId,
    };

    for (const sort of view.viewSorts) {
      const info = getNonReadableFieldInfoForViewField({
        fieldMetadataId: sort.fieldMetadataId,
        ...params,
      });

      if (isDefined(info)) {
        return { ...info, usage: 'sort' };
      }
    }

    for (const filter of view.viewFilters) {
      const info = getNonReadableFieldInfoForViewField({
        fieldMetadataId: filter.fieldMetadataId,
        ...params,
      });

      if (isDefined(info)) {
        return { ...info, usage: 'filter' };
      }
    }

    return undefined;
  }, [
    view,
    objectMetadataItem,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  ]);

  return {
    hasCurrentViewNonReadableFields: isDefined(nonReadableViewFieldInfo),
    nonReadableViewFieldInfo,
  };
};
