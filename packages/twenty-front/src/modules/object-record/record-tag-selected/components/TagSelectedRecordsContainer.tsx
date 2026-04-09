import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useBulkCreateTagJunctionRecords } from '@/object-record/record-tag-selected/hooks/useBulkCreateTagJunctionRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { msg, t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { IconTag } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  flex: 1;
  overflow-y: auto;
`;

const StyledFooterContainer = styled.div`
  align-items: flex-end;
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

const SELECTABLE_LIST_ID = 'tag-selected-records-selectable-list';
const FOCUS_ID = 'tag-selected-records-focus';

type TagSelectedRecordsContainerProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  contextStoreInstanceId: string;
};

export const TagSelectedRecordsContainer = ({
  objectMetadataItem,
  contextStoreInstanceId,
}: TagSelectedRecordsContainerProps) => {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
    contextStoreInstanceId,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
    contextStoreInstanceId,
  );

  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
    contextStoreInstanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const graphqlFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const { fetchAllRecords } = useLazyFetchAllRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter,
    recordGqlFields: { id: true },
  });

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const {
    bulkCreateTagJunctionRecords,
    tagObjectNameSingular,
    isConfigValid,
    junctionFieldName,
    junctionObjectNameSingular,
    sourceJoinColumnName,
    targetJoinColumnName,
    targetFieldName,
  } = useBulkCreateTagJunctionRecords({ objectMetadataItem });

  const {
    loading,
    recordsToSelect,
    selectedRecords,
    filteredSelectedRecords,
    selectedRecordsData,
  } = useRecordsForSelect({
    objectNameSingular: tagObjectNameSingular ?? '__invalid__',
    searchFilterText: searchText,
    selectedIds: selectedTagIds,
    limit: 20,
    allowRequestsToTwentyIcons,
  });

  const tagRecordMap = useMemo(
    () => new Map(selectedRecordsData.map((r) => [r.id, r])),
    [selectedRecordsData],
  );

  const store = useStore();

  const handleChange = (item: SelectableItem, newSelectedValue: boolean) => {
    setSelectedTagIds((prev) =>
      newSelectedValue
        ? [...prev, item.id]
        : prev.filter((id) => id !== item.id),
    );
  };

  const handleApply = async () => {
    if (!isDefined(tagObjectNameSingular) || selectedTagIds.length === 0) {
      return;
    }

    setIsApplying(true);

    try {
      let selectedRecordIds: string[];

      if (contextStoreTargetedRecordsRule.mode === 'exclusion') {
        const records = await fetchAllRecords();
        selectedRecordIds = records.map((record) => record.id);
      } else {
        selectedRecordIds = contextStoreTargetedRecordsRule.selectedRecordIds;
      }

      await bulkCreateTagJunctionRecords({ selectedRecordIds, selectedTagIds });

      // Directly update recordStoreFamilyState for each affected record so
      // the list view reflects the new tags immediately (same pattern as the
      // sidebar chip picker which updates the store in-place).
      if (
        isDefined(junctionFieldName) &&
        isDefined(junctionObjectNameSingular) &&
        isDefined(sourceJoinColumnName) &&
        isDefined(targetJoinColumnName) &&
        isDefined(targetFieldName)
      ) {
        const now = new Date().toISOString();

        for (const recordId of selectedRecordIds) {
          store.set(
            recordStoreFamilyState.atomFamily(recordId),
            (currentRecord: ObjectRecord | null | undefined) => {
              if (!isDefined(currentRecord)) return currentRecord;

              const currentJunctionRecords = (
                currentRecord[junctionFieldName] as ObjectRecord[]
              ) ?? [];
              const existingTagIds = new Set(
                currentJunctionRecords.map(
                  (jr) => jr[targetJoinColumnName] as string,
                ),
              );

              const newJunctionRecords = selectedTagIds
                .filter(
                  (tagId) =>
                    !existingTagIds.has(tagId) && tagRecordMap.has(tagId),
                )
                .map((tagId) => ({
                  id: v4(),
                  createdAt: now,
                  updatedAt: now,
                  __typename: getObjectTypename(junctionObjectNameSingular),
                  [sourceJoinColumnName]: recordId,
                  [targetJoinColumnName]: tagId,
                  [targetFieldName]: tagRecordMap.get(tagId),
                }));

              if (newJunctionRecords.length === 0) return currentRecord;

              return {
                ...currentRecord,
                [junctionFieldName]: [
                  ...currentJunctionRecords,
                  ...newJunctionRecords,
                ],
              } as ObjectRecord;
            },
          );
        }
      }

      closeSidePanelMenu();
    } finally {
      setIsApplying(false);
    }
  };

  const isApplyDisabled =
    selectedTagIds.length === 0 ||
    !isConfigValid ||
    !isDefined(tagObjectNameSingular);

  return (
    <SidePanelProvider value={{ isInSidePanel: true }}>
      <ShowPageContainer>
        <StyledContainer>
          <StyledContentContainer>
            <DropdownMenuSearchInput
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t(msg`Search tags`)}
            />
            <MultipleSelectDropdown
              selectableListId={SELECTABLE_LIST_ID}
              focusId={FOCUS_ID}
              itemsToSelect={recordsToSelect}
              filteredSelectedItems={filteredSelectedRecords}
              selectedItems={selectedRecords}
              searchFilter={searchText}
              onChange={handleChange}
              loadingItems={loading}
            />
          </StyledContentContainer>
          <StyledFooterContainer>
            <Button
              title={t`Cancel`}
              variant="secondary"
              size="small"
              onClick={closeSidePanelMenu}
            />
            <Button
              title={t`Apply to ${contextStoreNumberOfSelectedRecords} records`}
              variant="primary"
              accent="blue"
              size="small"
              Icon={IconTag}
              isLoading={isApplying}
              onClick={handleApply}
              disabled={isApplyDisabled || isApplying}
            />
          </StyledFooterContainer>
        </StyledContainer>
      </ShowPageContainer>
    </SidePanelProvider>
  );
};
