import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { getRelationScopeRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeRecordFiltersAndSorts';
import { getRelationScopeToEdit } from '@/object-record/record-column-scope/utils/getRelationScopeToEdit';
import { resolveScopableRelation } from '@/object-record/record-column-scope/utils/resolveScopableRelation';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { attachUngroupedRecordFiltersToRootRecordFilterGroup } from '@/object-record/record-filter-group/utils/attachUngroupedRecordFiltersToRootRecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { editColumnRequestComponentState } from '@/side-panel/pages/edit-column/states/editColumnRequestComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  SidePanelPages,
  type ViewFieldRelationScope,
} from 'twenty-shared/types';
import { findById, isDefined } from 'twenty-shared/utils';
import { IconEdit, IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

const EMPTY_RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [],
  filterGroups: [],
  sorts: [],
};

export const useOpenEditColumnInSidePanel = (recordTableId: string) => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const openEditColumnInSidePanel = useCallback(
    ({
      fieldMetadataItemId,
      recordFieldId,
    }: {
      fieldMetadataItemId: string;
      recordFieldId?: string;
    }) => {
      const viewId = store.get(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: contextStoreInstanceId,
        }),
      );

      const fieldMetadataItems = store.get(
        flattenedFieldMetadataItemsSelector.atom,
      );
      const fieldMetadataItem = fieldMetadataItems.find(
        findById(fieldMetadataItemId),
      );

      if (!isDefined(viewId) || !isDefined(fieldMetadataItem)) {
        return;
      }

      const recordField = store
        .get(
          currentRecordFieldsComponentState.atomFamily({
            instanceId: recordTableId,
          }),
        )
        .find(({ id }) => id === recordFieldId);
      const relationScope = recordField?.relationScope;

      const scopedRelationJunction = resolveScopableRelation({
        fieldMetadataItem,
        objectMetadataItems: store.get(
          objectMetadataItemsWithFieldsSelector.atom,
        ),
      })?.scopedRelationJunction;

      const { recordSorts, ...recordFiltersAndRecordFilterGroups } =
        getRelationScopeRecordFiltersAndSorts({
          relationScope: getRelationScopeToEdit({
            relationScope: relationScope ?? EMPTY_RELATION_SCOPE,
            scopedRelationJunction,
          }),
          fieldMetadataItems,
        });

      // The filter editor only shows filters held by a root filter group
      const { recordFilters, recordFilterGroups } =
        attachUngroupedRecordFiltersToRootRecordFilterGroup(
          recordFiltersAndRecordFilterGroups,
        );

      const pageId = v4();

      store.set(
        currentRecordFiltersComponentState.atomFamily({ instanceId: pageId }),
        recordFilters,
      );
      store.set(
        currentRecordFilterGroupsComponentState.atomFamily({
          instanceId: pageId,
        }),
        recordFilterGroups,
      );
      store.set(
        currentRecordSortsComponentState.atomFamily({ instanceId: pageId }),
        recordSorts,
      );
      store.set(
        editColumnRequestComponentState.atomFamily({ instanceId: pageId }),
        {
          recordTableId,
          contextStoreInstanceId,
          viewId,
          fieldMetadataItemId,
          recordFieldId,
        },
      );

      const isExistingColumn = isDefined(recordFieldId);

      navigateSidePanelMenu({
        page: SidePanelPages.EditColumn,
        pageTitle: isExistingColumn ? t`Edit column` : t`Add column`,
        pageIcon: isExistingColumn ? IconEdit : IconPlus,
        pageId,
      });
    },
    [contextStoreInstanceId, navigateSidePanelMenu, recordTableId, store, t],
  );

  return { openEditColumnInSidePanel };
};
