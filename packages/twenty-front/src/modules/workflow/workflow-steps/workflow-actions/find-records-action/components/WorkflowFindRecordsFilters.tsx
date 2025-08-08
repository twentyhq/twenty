import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeRecordGqlOperationFilter';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { WorkflowAdvancedFilterRecordFilterColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterRecordFilterColumn';
import { WorkflowAdvancedFilterRecordFilterGroupColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterRecordFilterGroupColumn';
import { FindRecordsActionFilter } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowEditActionFindRecords';
import { WorkflowFindRecordsAddFilterButton } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsAddFilterButton';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

export const WorkflowFindRecordsFilters = ({
  objectMetadataItem,
  onChange,
  readonly,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onChange: (filter: FindRecordsActionFilter) => void;
  readonly?: boolean;
}) => {
  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const defaultFieldMetadataItem =
    availableFieldMetadataItemsForFilter.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id ===
        objectMetadataItem?.labelIdentifierFieldMetadataId,
    ) ?? availableFieldMetadataItemsForFilter[0];

  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);

  const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
    currentRecordFiltersComponentState,
  );

  const onUpdate = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentRecordFilterGroups = getSnapshotValue(
          snapshot,
          currentRecordFilterGroupsCallbackState,
        );

        const currentRecordFilters = getSnapshotValue(
          snapshot,
          currentRecordFiltersCallbackState,
        );

        const gqlOperationFilter = computeRecordGqlOperationFilter({
          fields: objectMetadataItem.fields,
          filterValueDependencies: {},
          recordFilters: currentRecordFilters,
          recordFilterGroups: currentRecordFilterGroups,
        });

        const newFilter = {
          recordFilterGroups: currentRecordFilterGroups,
          recordFilters: currentRecordFilters,
          gqlOperationFilter,
        } as FindRecordsActionFilter;

        onChange(newFilter);
      },
    [
      currentRecordFilterGroupsCallbackState,
      currentRecordFiltersCallbackState,
      objectMetadataItem.fields,
      onChange,
    ],
  );

  return (
    <AdvancedFilterContext.Provider
      value={{
        onUpdate: readonly ? undefined : onUpdate,
        isWorkflowFindRecords: true,
        readonly,
      }}
    >
      {isDefined(rootRecordFilterGroup) ? (
        <StyledContainer>
          <StyledChildContainer>
            {childRecordFiltersAndRecordFilterGroups.map(
              (recordFilterGroupChild, recordFilterGroupChildIndex) =>
                isRecordFilterGroupChildARecordFilterGroup(
                  recordFilterGroupChild,
                ) ? (
                  <WorkflowAdvancedFilterRecordFilterGroupColumn
                    key={recordFilterGroupChild.id}
                    parentRecordFilterGroup={rootRecordFilterGroup}
                    recordFilterGroup={recordFilterGroupChild}
                    recordFilterGroupIndex={recordFilterGroupChildIndex}
                  />
                ) : (
                  <WorkflowAdvancedFilterRecordFilterColumn
                    key={recordFilterGroupChild.id}
                    recordFilterGroup={rootRecordFilterGroup}
                    recordFilter={recordFilterGroupChild}
                    recordFilterIndex={recordFilterGroupChildIndex}
                  />
                ),
            )}
          </StyledChildContainer>
          {!readonly && (
            <AdvancedFilterAddFilterRuleSelect
              recordFilterGroup={rootRecordFilterGroup}
            />
          )}
        </StyledContainer>
      ) : (
        <WorkflowFindRecordsAddFilterButton
          defaultFieldMetadataItem={defaultFieldMetadataItem}
        />
      )}
    </AdvancedFilterContext.Provider>
  );
};
