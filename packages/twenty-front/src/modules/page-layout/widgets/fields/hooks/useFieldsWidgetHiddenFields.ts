import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { getHiddenFieldsFromGroups } from '@/page-layout/widgets/fields/utils/getHiddenFieldsFromGroups';
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

    const activeFields = objectMetadataItem.fields.filter(
      (field) => field.isActive,
    );

    if (isDefined(view) && isNonEmptyArray(view.viewFieldGroups)) {
      const groups: FieldsWidgetGroup[] = view.viewFieldGroups.map((group) => {
        const fields: FieldsWidgetGroupField[] = (group.viewFields ?? [])
          .map((viewField) => {
            const fieldMetadataItem = activeFields.find(
              (f) => f.id === viewField.fieldMetadataId,
            );

            if (!isDefined(fieldMetadataItem)) {
              return null;
            }

            return {
              fieldMetadataItem,
              position: viewField.position,
              isVisible: viewField.isVisible,
              globalIndex: 0,
            };
          })
          .filter(isDefined);

        return {
          id: group.id,
          name: group.name,
          position: group.position,
          isVisible: group.isVisible,
          fields,
        };
      });

      return getHiddenFieldsFromGroups(groups);
    }

    if (isDefined(view) && view.viewFields.length > 0) {
      let globalIndex = 0;

      return [...view.viewFields]
        .sort((a, b) => a.position - b.position)
        .filter((viewField) => !viewField.isVisible)
        .map((viewField) => {
          const fieldMetadataItem = activeFields.find(
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
