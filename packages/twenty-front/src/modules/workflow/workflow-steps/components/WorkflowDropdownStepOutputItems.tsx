import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useUpdateStepFilterFromVariable } from '@/workflow/workflow-steps/filters/hooks/useUpdateStepFilterFromVariable';
import { WorkflowVariableSearchResultItems } from '@/workflow/workflow-variables/components/WorkflowVariableSearchResultItems';
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
import { isNonEmptyString } from '@sniptt/guards';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';

type WorkflowDropdownStepOutputItemsProps = {
  stepFilter: StepFilter;
  step: StepOutputSchemaV2;
  initialPath?: string[];
  onBack: () => void;
};

export const WorkflowDropdownStepOutputItems = ({
  stepFilter,
  step,
  initialPath,
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
    <>
      <Dropdown.Header>
        <LightIconButton size="sm" aria-label={t`Back`} onClick={goBack}>
          <IconChevronLeft />
        </LightIconButton>
        <Dropdown.Title>{getStepHeaderLabel(step, currentPath)}</Dropdown.Title>
        <Dropdown.Close aria-label={t`Close`} />
      </Dropdown.Header>
      <Dropdown.Search
        key={JSON.stringify(currentPath)}
        autoFocus
        aria-label={t`Search fields`}
        value={searchInputValue}
        onValueChange={setSearchInputValue}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {isSearching ? (
          <WorkflowVariableSearchResultItems
            searchResults={searchResults}
            onSelect={handleSelectSearchResult}
          />
        ) : (
          <>
            {shouldDisplaySubStepObject && (
              <Dropdown.OptionItem
                onSelect={handleSelectObject}
                hasSubmenu={false}
                description={t`Pick a ${subStepObjectDisplay?.label} record`}
                startIcon={
                  <SelectOptionIcon
                    Icon={
                      isDefined(subStepObjectDisplay?.icon)
                        ? getIcon(subStepObjectDisplay.icon)
                        : undefined
                    }
                    color={subStepObjectDisplay?.iconColor}
                  />
                }
              >
                {subStepObjectDisplay?.label ?? ''}
              </Dropdown.OptionItem>
            )}
            {isNonEmptyArray(options) && shouldDisplaySubStepObject && (
              <Dropdown.Separator />
            )}
            {options.map(([key, subStep]) => {
              if (!isDefined(subStep)) {
                return null;
              }

              return (
                <Dropdown.OptionItem
                  key={key}
                  onSelect={() => handleSelectField(key)}
                  hasSubmenu={!subStep.isLeaf}
                  closeOnSelect={subStep.isLeaf}
                  description={
                    subStep.isLeaf ? subStep.value?.toString() : undefined
                  }
                  startIcon={
                    <SelectOptionIcon
                      Icon={
                        isNonEmptyString(subStep.icon)
                          ? getIcon(subStep.icon)
                          : getIcon(
                              getStepItemIcon({
                                itemType: subStep.type,
                              }),
                            )
                      }
                    />
                  }
                >
                  {subStep.label || key}
                </Dropdown.OptionItem>
              );
            })}
          </>
        )}
      </Dropdown.Section>
    </>
  );
};
