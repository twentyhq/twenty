import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { useAddDraftViewForFieldRelationTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForFieldRelationTableWidget';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldDisplayMode,
  type FieldConfiguration,
} from '~/generated-metadata/graphql';

type ResolveFieldWidgetRelationTableViewIdChangeArgs = {
  selectedField: FieldMetadataItem | undefined;
  selectedNestedField?: FieldMetadataItem;
  currentDisplayMode: FieldDisplayMode | undefined;
  isSelectingDifferentField: boolean;
  widgetId: string | undefined;
  currentViewId: string | null | undefined;
};

export const useResolveFieldWidgetRelationTableViewIdChange = (
  pageLayoutId: string,
) => {
  const { addDraftViewForFieldRelationTableWidget } =
    useAddDraftViewForFieldRelationTableWidget(pageLayoutId);

  const resolveFieldWidgetRelationTableViewIdChange = ({
    selectedField,
    selectedNestedField,
    currentDisplayMode,
    isSelectingDifferentField,
    widgetId,
    currentViewId,
  }: ResolveFieldWidgetRelationTableViewIdChangeArgs):
    | Pick<FieldConfiguration, 'viewId'>
    | undefined => {
    const {
      targetObjectMetadataId,
      inverseFieldMetadataId,
      relationTargetFieldMetadataId,
    } = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: selectedField,
      nestedRelationFieldMetadataItem: selectedNestedField,
    });

    const isValidRelationChain =
      isDefined(selectedField) &&
      isOneToManyRelationField(selectedField) &&
      (!isDefined(selectedNestedField) ||
        isOneToManyRelationField(selectedNestedField));

    const shouldRegenerateRelationTableView =
      currentDisplayMode === FieldDisplayMode.TABLE &&
      isSelectingDifferentField &&
      isValidRelationChain &&
      isDefined(widgetId) &&
      isDefined(targetObjectMetadataId) &&
      isDefined(inverseFieldMetadataId);

    const regeneratedRelationTableViewId = shouldRegenerateRelationTableView
      ? addDraftViewForFieldRelationTableWidget({
          widgetId,
          targetObjectMetadataId,
          inverseFieldMetadataId,
          relationTargetFieldMetadataId,
        })
      : undefined;

    if (isDefined(regeneratedRelationTableViewId)) {
      return { viewId: regeneratedRelationTableViewId };
    }

    if (isSelectingDifferentField && isDefined(currentViewId)) {
      return { viewId: undefined };
    }

    return undefined;
  };

  return { resolveFieldWidgetRelationTableViewIdChange };
};
