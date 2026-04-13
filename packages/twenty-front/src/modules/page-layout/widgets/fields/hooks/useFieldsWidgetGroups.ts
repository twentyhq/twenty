import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsWidgetDisplayMode } from '@/page-layout/widgets/fields/types/FieldsWidgetDisplayMode';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { buildDefaultFieldsWidgetGroups } from '@/page-layout/widgets/fields/utils/buildDefaultFieldsWidgetGroups';
import { filterDraftGroupsForDisplay } from '@/page-layout/widgets/fields/utils/filterDraftGroupsForDisplay';
import { useViewById } from '@/views/hooks/useViewById';
import { useMemo } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type UseFieldsWidgetGroupsParams = {
  viewId: string | null;
  objectNameSingular: string;
};

export const useFieldsWidgetGroups = ({
  viewId,
  objectNameSingular,
}: UseFieldsWidgetGroupsParams) => {
  const { view } = useViewById(viewId);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const groups = useMemo<FieldsWidgetGroup[]>(() => {
    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    if (isDefined(view) && isNonEmptyArray(view.viewFieldGroups)) {
      const sortedGroups = view.viewFieldGroups.toSorted(
        (a, b) => a.position - b.position,
      );

      let globalIndex = 0;

      return sortedGroups
        .filter((group) => group.isVisible)
        .map((group) => {
          const groupFields = [...(group.viewFields ?? [])].sort(
            (a, b) => a.position - b.position,
          );

          const fields: FieldsWidgetGroupField[] = groupFields
            .filter((field) => field.isVisible)
            .map((viewField) => {
              const fieldMetadataItem = objectMetadataItem.fields.find(
                (f) => f.id === viewField.fieldMetadataId,
              );

              if (!isDefined(fieldMetadataItem)) {
                return null;
              }

              const field: FieldsWidgetGroupField = {
                fieldMetadataItem,
                position: viewField.position,
                isVisible: viewField.isVisible,
                globalIndex: globalIndex++,
              };

              return field;
            })
            .filter(isDefined);

          return {
            id: group.id,
            name: group.name,
            position: group.position,
            isVisible: group.isVisible,
            fields,
          };
        })
        .filter((group) => group.fields.length > 0);
    }

    return filterDraftGroupsForDisplay(
      buildDefaultFieldsWidgetGroups({
        fields: objectMetadataItem.fields,
        objectNameSingular,
        labelIdentifierFieldMetadataItemId:
          labelIdentifierFieldMetadataItem?.id,
      }),
    );
  }, [
    objectMetadataItem,
    objectNameSingular,
    labelIdentifierFieldMetadataItem,
    view,
  ]);

  const displayMode: FieldsWidgetDisplayMode = 'grouped';

  return {
    groups,
    displayMode,
    isFromView: isDefined(view) && isNonEmptyArray(view.viewFieldGroups),
  };
};
