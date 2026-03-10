import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useViewById } from '@/views/hooks/useViewById';
import { useMemo } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type UseFieldsWidgetHiddenFieldsParams = {
  viewId: string | null;
  objectNameSingular: string;
};

export const useFieldsWidgetHiddenFields = ({
  viewId,
  objectNameSingular,
}: UseFieldsWidgetHiddenFieldsParams) => {
  const { view } = useViewById(viewId);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const hiddenFields = useMemo<FieldsWidgetGroupField[]>(() => {
    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    if (isDefined(view) && isNonEmptyArray(view.viewFieldGroups)) {
      let globalIndex = 0;

      const result: FieldsWidgetGroupField[] = [];

      const sortedGroups = view.viewFieldGroups.toSorted(
        (a, b) => a.position - b.position,
      );

      for (const group of sortedGroups) {
        const groupFields = [...(group.viewFields ?? [])].sort(
          (a, b) => a.position - b.position,
        );

        for (const viewField of groupFields) {
          if (viewField.isVisible && group.isVisible) {
            continue;
          }

          const fieldMetadataItem = objectMetadataItem.fields.find(
            (f) => f.id === viewField.fieldMetadataId,
          );

          if (!isDefined(fieldMetadataItem)) {
            continue;
          }

          result.push({
            fieldMetadataItem,
            position: viewField.position,
            isVisible: false,
            globalIndex: globalIndex++,
          });
        }
      }

      return result;
    }

    if (isDefined(view) && view.viewFields.length > 0) {
      let globalIndex = 0;

      return [...view.viewFields]
        .sort((a, b) => a.position - b.position)
        .filter((viewField) => !viewField.isVisible)
        .map((viewField) => {
          const fieldMetadataItem = objectMetadataItem.fields.find(
            (f) => f.id === viewField.fieldMetadataId,
          );

          if (!isDefined(fieldMetadataItem)) {
            return null;
          }

          return {
            fieldMetadataItem,
            position: viewField.position,
            isVisible: false,
            globalIndex: globalIndex++,
          };
        })
        .filter(isDefined);
    }

    return [];
  }, [objectMetadataItem, view]);

  return { hiddenFields };
};
