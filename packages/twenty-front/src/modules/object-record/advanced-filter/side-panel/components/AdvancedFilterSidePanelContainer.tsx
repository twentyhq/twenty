import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterSidePanelCreateRootFilterButton } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelCreateRootFilterButton';
import { AdvancedFilterSidePanelRecordFilterColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelRecordFilterColumn';
import { AdvancedFilterSidePanelRecordFilterGroupColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelRecordFilterGroupColumn';
import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChildContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

export type AdvancedFilterSidePanelContainerProps = {
  readonly?: boolean;
  onUpdate?: () => void;
  objectMetadataItem: ObjectMetadataItem;
  VariablePicker?: VariablePickerComponent;
  isWorkflowFindRecords?: boolean;
};

export const AdvancedFilterSidePanelContainer = ({
  readonly,
  onUpdate,
  objectMetadataItem,
  VariablePicker,
  isWorkflowFindRecords,
}: AdvancedFilterSidePanelContainerProps) => {
  const rootRecordFilterGroup = useAtomComponentSelectorValue(
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
                  <AdvancedFilterSidePanelRecordFilterGroupColumn
                    key={recordFilterGroupChild.id}
                    parentRecordFilterGroup={rootRecordFilterGroup}
                    recordFilterGroup={recordFilterGroupChild}
                    recordFilterGroupIndex={recordFilterGroupChildIndex}
                  />
                ) : (
                  <AdvancedFilterSidePanelRecordFilterColumn
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
        <AdvancedFilterSidePanelCreateRootFilterButton
          objectMetadataItem={objectMetadataItem}
        />
      )}
    </AdvancedFilterContext.Provider>
  );
};
