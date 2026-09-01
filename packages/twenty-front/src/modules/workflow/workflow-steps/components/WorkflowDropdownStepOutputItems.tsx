import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowVariableSearchResultItems } from '@/workflow/workflow-variables/components/WorkflowVariableSearchResultItems';
import { useUpdateStepFilterFromVariable } from '@/workflow/workflow-steps/filters/hooks/useUpdateStepFilterFromVariable';
import { useVariableDropdown } from '@/workflow/workflow-variables/hooks/useVariableDropdown';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type WorkflowVariableSelection } from '@/workflow/workflow-variables/types/WorkflowVariableSelection';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getStepItemIcon } from '@/workflow/workflow-variables/utils/getStepItemIcon';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { getWorkflowVariableRecordObjectDisplay } from '@/workflow/workflow-variables/utils/getWorkflowVariableRecordObjectDisplay';
import { useLingui } from '@lingui/react/macro';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowDropdownStepOutputItemsProps = {
  stepFilter: StepFilter;
  step: StepOutputSchemaV2;
  initialPath?: string[];
  onSelect: () => void;
  onBack: () => void;
};

export const WorkflowDropdownStepOutputItems = ({
  stepFilter,
  step,
  initialPath,
  onSelect,
  onBack,
}: WorkflowDropdownStepOutputItemsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { updateStepFilterFromVariable } = useUpdateStepFilterFromVariable({
    stepFilter,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const handleStepFilterFieldSelect = ({
    rawVariableName,
    isFullRecord,
  }: WorkflowVariableSelection) => {
    updateStepFilterFromVariable({
      rawVariableName,
      isFullRecord,
      stepType: step.type,
    });
    onSelect();
  };

  const {
    searchInputValue,
    setSearchInputValue,
    handleSelectField,
    goBack,
    options,
    currentPath,
    isSearching,
    searchResults,
    handleSelectSearchResult,
  } = useVariableDropdown({
    step,
    initialPath,
    onSelect: handleStepFilterFieldSelect,
    onBack,
    shouldDisplaySpecialItems: false,
    shouldDisplayRecordObjects: true,
  });

  const getDisplayedSubStepObject = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (!isRecordOutputSchemaV2(currentSubStep)) {
      return;
    }

    return currentSubStep.object;
  };

  const handleSelectObject = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (!isRecordOutputSchemaV2(currentSubStep)) {
      return;
    }

    updateStepFilterFromVariable({
      rawVariableName: getVariableTemplateFromPath({
        stepId: step.id,
        path: [...currentPath, currentSubStep.object.fieldIdName ?? 'id'],
      }),
      isFullRecord: true,
      stepType: step.type,
    });
    onSelect();
  };

  const displayedSubStepObject = getDisplayedSubStepObject();

  const subStepObjectMetadataItem = isDefined(
    displayedSubStepObject?.objectMetadataId,
  )
    ? objectMetadataItems.find(
        (item) => item.id === displayedSubStepObject?.objectMetadataId,
      )
    : undefined;

  const subStepObjectDisplay = isDefined(displayedSubStepObject)
    ? getWorkflowVariableRecordObjectDisplay({
        recordObject: displayedSubStepObject,
        objectMetadataItem: subStepObjectMetadataItem,
      })
    : undefined;

  const shouldDisplaySubStepObject =
    subStepObjectDisplay?.isSelectable === true;

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={goBack}
            Icon={IconChevronLeft}
          />
        }
      >
        <OverflowingTextWithTooltip
          text={getStepHeaderLabel(step, currentPath)}
        />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {isSearching ? (
          <WorkflowVariableSearchResultItems
            searchResults={searchResults}
            onSelect={handleSelectSearchResult}
          />
        ) : (
          <>
            {shouldDisplaySubStepObject && (
              <MenuItemSelect
                selected={false}
                focused={false}
                onClick={handleSelectObject}
                text={subStepObjectDisplay?.label ?? ''}
                hasSubMenu={false}
                LeftIcon={
                  isDefined(subStepObjectDisplay?.icon)
                    ? getIcon(subStepObjectDisplay.icon)
                    : undefined
                }
                leftIconColor={subStepObjectDisplay?.iconColor}
                contextualText={t`Pick a ${subStepObjectDisplay?.label} record`}
              />
            )}
            {options.length > 0 && shouldDisplaySubStepObject && (
              <DropdownMenuSeparator />
            )}
            {options.map(([key, subStep]) => {
              if (!isDefined(subStep)) {
                return null;
              }

              return (
                <MenuItemSelect
                  key={key}
                  selected={false}
                  focused={false}
                  onClick={() => handleSelectField(key)}
                  text={subStep.label || key}
                  hasSubMenu={!subStep.isLeaf}
                  LeftIcon={
                    subStep.icon
                      ? getIcon(subStep.icon)
                      : getIcon(
                          getStepItemIcon({
                            itemType: subStep.type,
                          }),
                        )
                  }
                  contextualText={
                    subStep.isLeaf ? subStep.value?.toString() : undefined
                  }
                />
              );
            })}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
