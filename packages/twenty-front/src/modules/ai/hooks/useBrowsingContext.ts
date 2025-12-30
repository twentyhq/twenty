import { type BrowsingContext } from '@/ai/types/BrowsingContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';

export const useGetBrowsingContext = () => {
  const getBrowsingContext = useRecoilCallback(
    ({ snapshot }) =>
      (): BrowsingContext | null => {
        const instanceId = MAIN_CONTEXT_STORE_INSTANCE_ID;

        const viewType = snapshot
          .getLoadable(
            contextStoreCurrentViewTypeComponentState.atomFamily({
              instanceId,
            }),
          )
          .getValue();

        const objectMetadataItemId = snapshot
          .getLoadable(
            contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
              instanceId,
            }),
          )
          .getValue();

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === objectMetadataItemId,
        );

        if (!objectMetadataItem) {
          return null;
        }

        if (viewType === ContextStoreViewType.ShowPage) {
          const targetedRecordsRule = snapshot
            .getLoadable(
              contextStoreTargetedRecordsRuleComponentState.atomFamily({
                instanceId,
              }),
            )
            .getValue();

          if (
            targetedRecordsRule.mode !== 'selection' ||
            targetedRecordsRule.selectedRecordIds.length !== 1
          ) {
            return null;
          }

          return {
            type: 'recordPage',
            objectNameSingular: objectMetadataItem.nameSingular,
            recordId: targetedRecordsRule.selectedRecordIds[0],
          };
        }

        if (
          viewType === ContextStoreViewType.Table ||
          viewType === ContextStoreViewType.Kanban
        ) {
          const currentViewId = snapshot
            .getLoadable(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId,
              }),
            )
            .getValue();

          const currentView = snapshot
            .getLoadable(
              coreViewFromViewIdFamilySelector({
                viewId: currentViewId ?? '',
              }),
            )
            .getValue();

          if (!currentView) {
            return null;
          }

          const contextStoreFilters = snapshot
            .getLoadable(
              contextStoreFiltersComponentState.atomFamily({
                instanceId,
              }),
            )
            .getValue();

          const filterDescriptions = contextStoreFilters.map((filter) => {
            const fieldMetadataItem = objectMetadataItem.fields.find(
              (field) => field.id === filter.fieldMetadataId,
            );
            const fieldLabel = fieldMetadataItem?.label ?? t`Unknown field`;

            return `${fieldLabel} ${filter.operand} "${filter.displayValue}"`;
          });

          return {
            type: 'listView',
            objectNameSingular: objectMetadataItem.nameSingular,
            viewId: currentView.id,
            viewName: currentView.name,
            filterDescriptions,
          };
        }

        return null;
      },
    [],
  );

  return { getBrowsingContext };
};
