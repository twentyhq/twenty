import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { isScopableRelationField } from '@/object-record/record-column-scope/utils/isScopableRelationField';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { SidePanelEditColumnFilterDropdownStatesEffect } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnFilterDropdownStatesEffect';
import { SidePanelEditColumnForm } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnForm';
import {
  type EditColumnRequest,
  editColumnRequestComponentState,
} from '@/side-panel/pages/edit-column/states/editColumnRequestComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

const SidePanelEditColumnPageContent = ({
  editColumnRequest,
}: {
  editColumnRequest: EditColumnRequest;
}) => {
  const {
    recordTableId,
    contextStoreInstanceId,
    viewId,
    fieldMetadataItemId,
    recordFieldId,
  } = editColumnRequest;

  const sidePanelPageId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    contextStoreInstanceId,
  );

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    recordTableId,
  );
  const recordField = currentRecordFields.find(
    ({ id }) => id === recordFieldId,
  );

  const { foundFieldMetadataItem: fieldMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  // Saving goes to the current view, so the column of a view left meanwhile is no longer editable
  if (contextStoreCurrentViewId !== viewId) {
    return null;
  }

  if (isDefined(recordFieldId) && !isDefined(recordField)) {
    return null;
  }

  if (
    !isDefined(fieldMetadataItem) ||
    !isScopableRelationField({ fieldMetadataItem, objectMetadataItems })
  ) {
    return null;
  }

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(relationObjectMetadataItem)) {
    return null;
  }

  const { scopedRelationJunction } = resolveScopedRelationJunction({
    fieldMetadataItem,
    objectMetadataItems,
  });

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: contextStoreInstanceId }}
    >
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId: sidePanelPageId }}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: sidePanelPageId }}
        >
          <RecordSortsComponentInstanceContext.Provider
            value={{ instanceId: sidePanelPageId }}
          >
            <SidePanelEditColumnForm
              recordTableId={recordTableId}
              fieldMetadataItem={fieldMetadataItem}
              relationObjectMetadataItem={relationObjectMetadataItem}
              scopedRelationJunction={scopedRelationJunction}
              recordFieldId={recordFieldId}
              storedRelationScope={recordField?.relationScope}
              storedRelationTargetFieldMetadataId={
                recordField?.relationTargetFieldMetadataId
              }
            />
            <SidePanelEditColumnFilterDropdownStatesEffect />
          </RecordSortsComponentInstanceContext.Provider>
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};

export const SidePanelEditColumnPage = () => {
  const editColumnRequest = useAtomComponentStateValue(
    editColumnRequestComponentState,
  );

  if (!isDefined(editColumnRequest)) {
    return null;
  }

  return (
    <SidePanelEditColumnPageContent editColumnRequest={editColumnRequest} />
  );
};
