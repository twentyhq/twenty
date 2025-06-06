import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { AdvancedFilterRecordFilterColumn } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterColumn';
import { AdvancedFilterRecordFilterGroupColumn } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupColumn';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeRecordGqlOperationFilter';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FindRecordsActionFilter } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFindRecords';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

export const WorkflowFindRecordFilters = ({
  objectMetadataItem,
  onChange,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onChange: (filter: FindRecordsActionFilter) => void;
}) => {
  const rootRecordFilterGroup = useRecoilComponentValueV2(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

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

  const addRootRecordFilterGroup = () => {
    const alreadyHasAdvancedFilterGroup = isDefined(rootRecordFilterGroup);

    if (!alreadyHasAdvancedFilterGroup) {
      const newRecordFilterGroup = {
        id: v4(),
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      };

      upsertRecordFilterGroup(newRecordFilterGroup);

      if (!isDefined(defaultFieldMetadataItem)) {
        throw new Error('Missing default filter definition');
      }

      const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
        defaultFieldMetadataItem,
      );

      newRecordFilter.recordFilterGroupId = newRecordFilterGroup.id;

      upsertRecordFilter(newRecordFilter);
    }
  };

  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(currentRecordFilterGroupsComponentState);

  const currentRecordFiltersCallbackState = useRecoilComponentCallbackStateV2(
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
        onUpdate,
        isColumn: true,
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
                  <AdvancedFilterRecordFilterGroupColumn
                    key={recordFilterGroupChild.id}
                    parentRecordFilterGroup={rootRecordFilterGroup}
                    recordFilterGroup={recordFilterGroupChild}
                    recordFilterGroupIndex={recordFilterGroupChildIndex}
                    VariablePicker={WorkflowVariablePicker}
                  />
                ) : (
                  <AdvancedFilterRecordFilterColumn
                    key={recordFilterGroupChild.id}
                    recordFilterGroup={rootRecordFilterGroup}
                    recordFilter={recordFilterGroupChild}
                    recordFilterIndex={recordFilterGroupChildIndex}
                    VariablePicker={WorkflowVariablePicker}
                  />
                ),
            )}
          </StyledChildContainer>
          <AdvancedFilterAddFilterRuleSelect
            recordFilterGroup={rootRecordFilterGroup}
          />
        </StyledContainer>
      ) : (
        <Button
          Icon={IconFilter}
          size="small"
          variant="secondary"
          accent="default"
          onClick={addRootRecordFilterGroup}
          ariaLabel="Add filter"
          title="Add filter"
        />
      )}
    </AdvancedFilterContext.Provider>
  );
};
