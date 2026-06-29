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
    currentDisplayMode,
    isSelectingDifferentField,
    widgetId,
    currentViewId,
  }: ResolveFieldWidgetRelationTableViewIdChangeArgs):
    | Pick<FieldConfiguration, 'viewId'>
    | undefined => {
    const targetObjectMetadataId =
      selectedField?.relation?.targetObjectMetadata.id;
    const targetFieldMetadataId =
      selectedField?.relation?.targetFieldMetadata.id;

    const shouldRegenerateRelationTableView =
      currentDisplayMode === FieldDisplayMode.TABLE &&
      isSelectingDifferentField &&
      selectedField?.type === FieldMetadataType.RELATION &&
      selectedField.relation?.type === RelationType.ONE_TO_MANY &&
      isDefined(widgetId) &&
      isDefined(targetObjectMetadataId) &&
      isDefined(targetFieldMetadataId);

    const regeneratedRelationTableViewId = shouldRegenerateRelationTableView
      ? addDraftViewForFieldRelationTableWidget(
          widgetId,
          targetObjectMetadataId,
          targetFieldMetadataId,
        )
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
