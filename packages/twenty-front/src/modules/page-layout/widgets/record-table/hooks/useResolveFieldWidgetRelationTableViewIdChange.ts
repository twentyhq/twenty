import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAddDraftViewForFieldRelationTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForFieldRelationTableWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldDisplayMode,
  type FieldConfiguration,
  RelationType,
} from '~/generated-metadata/graphql';

type ResolveFieldWidgetRelationTableViewIdChangeArgs = {
  selectedField: FieldMetadataItem | undefined;
  selectedNestedField?: FieldMetadataItem;
  currentDisplayMode: FieldDisplayMode | undefined;
  isSelectingDifferentField: boolean;
  widgetId: string | undefined;
  currentViewId: string | null | undefined;
};

const isOneToManyRelationField = (
  fieldMetadataItem: FieldMetadataItem | undefined,
): boolean =>
  fieldMetadataItem?.type === FieldMetadataType.RELATION &&
  fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY;

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
    // With a nested relation, the embedded view lists records of the nested
    // relation's target (e.g. Company -> People -> Opportunities lists
    // opportunities), scoped through the nested inverse relation back to the
    // current record. Without one, it lists the direct relation's records.
    const targetObjectMetadataId = isDefined(selectedNestedField)
      ? selectedNestedField.relation?.targetObjectMetadata.id
      : selectedField?.relation?.targetObjectMetadata.id;
    const inverseFieldMetadataId = isDefined(selectedNestedField)
      ? selectedNestedField.relation?.targetFieldMetadata.id
      : selectedField?.relation?.targetFieldMetadata.id;
    const relationTargetFieldMetadataId = isDefined(selectedNestedField)
      ? selectedField?.relation?.targetFieldMetadata.id
      : null;

    const isValidRelationChain = isDefined(selectedNestedField)
      ? isOneToManyRelationField(selectedField) &&
        isOneToManyRelationField(selectedNestedField) &&
        isDefined(relationTargetFieldMetadataId)
      : isOneToManyRelationField(selectedField);

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
