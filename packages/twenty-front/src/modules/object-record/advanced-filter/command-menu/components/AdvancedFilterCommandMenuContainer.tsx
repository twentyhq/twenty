import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterCommandMenuCreateRootFilterButton } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuCreateRootFilterButton';
import { AdvancedFilterCommandMenuRecordFilterColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuRecordFilterColumn';
import { AdvancedFilterCommandMenuRecordFilterGroupColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuRecordFilterGroupColumn';
import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
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

export type AdvancedFilterCommandMenuContainerProps = {
  readonly?: boolean;
  onUpdate?: () => void;
  objectMetadataItem: ObjectMetadataItem;
  VariablePicker?: VariablePickerComponent;
  isWorkflowFindRecords?: boolean;
};

export const AdvancedFilterCommandMenuContainer = ({
  readonly,
  onUpdate,
  objectMetadataItem,
  VariablePicker,
  isWorkflowFindRecords,
}: AdvancedFilterCommandMenuContainerProps) => {
  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  return (
    <AdvancedFilterContext.Provider
      value={{
        onUpdate: readonly ? undefined : onUpdate,
        isWorkflowFindRecords,
        readonly,
        VariablePicker,
        objectMetadataItem,
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
                  <AdvancedFilterCommandMenuRecordFilterGroupColumn
                    key={recordFilterGroupChild.id}
                    parentRecordFilterGroup={rootRecordFilterGroup}
                    recordFilterGroup={recordFilterGroupChild}
                    recordFilterGroupIndex={recordFilterGroupChildIndex}
                  />
                ) : (
                  <AdvancedFilterCommandMenuRecordFilterColumn
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
        <AdvancedFilterCommandMenuCreateRootFilterButton
          objectMetadataItem={objectMetadataItem}
        />
      )}
    </AdvancedFilterContext.Provider>
  );
};
