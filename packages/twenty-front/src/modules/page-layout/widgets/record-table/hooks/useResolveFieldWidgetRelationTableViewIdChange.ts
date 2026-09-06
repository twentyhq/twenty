import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { isFieldWidgetEligibleNestedParentField } from '@/page-layout/widgets/field/utils/isFieldWidgetEligibleNestedParentField';
import { useAddDraftViewForFieldRelationTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForFieldRelationTableWidget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldDisplayMode,
  type FieldConfiguration,
} from '~/generated-metadata/graphql';

type ResolveFieldWidgetRelationTableViewIdChangeArgs = {
  selectedField: FieldMetadataItem | undefined;
  selectedNestedField?: FieldMetadataItem;
  nextDisplayMode: FieldDisplayMode | undefined;
  isSelectingDifferentChain: boolean;
  widgetId: string | undefined;
  currentViewId: string | null | undefined;
};

export const useResolveFieldWidgetRelationTableViewIdChange = (
  pageLayoutId: string,
) => {
  const { addDraftViewForFieldRelationTableWidget } =
    useAddDraftViewForFieldRelationTableWidget(pageLayoutId);

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  // The embedded view must always list the selected chain's terminal object.
  // Whenever the selection results in a table widget, a fresh draft view is
  // generated on a chain change or a missing view id; otherwise a view id
  // belonging to the previous chain is cleared so the layout dropdown can
  // lazily create the right one.
  const resolveFieldWidgetRelationTableViewIdChange = ({
    selectedField,
    selectedNestedField,
    nextDisplayMode,
    isSelectingDifferentChain,
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
      objectMetadataItems,
    });

    const isValidRelationChain =
      isDefined(selectedField) &&
      (isDefined(selectedNestedField)
        ? isFieldWidgetEligibleNestedParentField(selectedField) &&
          isOneToManyRelationField(selectedNestedField)
        : isOneToManyRelationField(selectedField));

    const shouldRegenerateRelationTableView =
      nextDisplayMode === FieldDisplayMode.TABLE &&
      (isSelectingDifferentChain || !isDefined(currentViewId)) &&
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

    if (isSelectingDifferentChain && isDefined(currentViewId)) {
      return { viewId: undefined };
    }

    return undefined;
  };

  return { resolveFieldWidgetRelationTableViewIdChange };
};
