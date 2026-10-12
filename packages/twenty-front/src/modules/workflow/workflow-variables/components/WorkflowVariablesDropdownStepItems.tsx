import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { WorkflowVariableSearchResultItems } from '@/workflow/workflow-variables/components/WorkflowVariableSearchResultItems';
import { useVariableDropdown } from '@/workflow/workflow-variables/hooks/useVariableDropdown';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getStepItemIcon } from '@/workflow/workflow-variables/utils/getStepItemIcon';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { getWorkflowVariableRecordObjectDisplay } from '@/workflow/workflow-variables/utils/getWorkflowVariableRecordObjectDisplay';
import {
  getWorkflowVariableSpecialItems,
  type WorkflowVariableSpecialItem,
} from '@/workflow/workflow-variables/utils/getWorkflowVariableSpecialItems';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';

type WorkflowVariablesDropdownStepItemsProps = {
  step: StepOutputSchemaV2;
  initialPath?: string[];
  onSelect: (value: string) => void;
  onBack: () => void;
  shouldDisplayRecordObjects: boolean;
  objectNameSingularsToSelect?: string[];
};

export const WorkflowVariablesDropdownStepItems = ({
  step,
  initialPath,
  onSelect,
  onBack,
  shouldDisplayRecordObjects,
  objectNameSingularsToSelect,
}: WorkflowVariablesDropdownStepItemsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
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
    onSelect: ({ rawVariableName }) => onSelect(rawVariableName),
    onBack,
    shouldDisplayRecordObjects,
    objectNameSingularsToSelect,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

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

    onSelect(
      getVariableTemplateFromPath({
        stepId: step.id,
        path: [...currentPath, currentSubStep.object.fieldIdName ?? 'id'],
      }),
    );
  };

  const specialItems = getWorkflowVariableSpecialItems({
    step,
    currentPath,
  });

  const handleSelectSpecialItem = (
    specialItem: WorkflowVariableSpecialItem,
  ) => {
    onSelect(
      getVariableTemplateFromPath({
        stepId: step.id,
        path: specialItem.path,
      }),
    );
  };

  const displayedSubStepObject = getDisplayedSubStepObject();

  const displayedSubStepObjectMetadata = isDefined(displayedSubStepObject)
    ? objectMetadataItems.find(
        (item) => item.id === displayedSubStepObject?.objectMetadataId,
      )
    : undefined;

  const displayedSubStepObjectDisplay = isDefined(displayedSubStepObject)
    ? getWorkflowVariableRecordObjectDisplay({
        recordObject: displayedSubStepObject,
        objectMetadataItem: displayedSubStepObjectMetadata,
        objectNameSingularsToSelect,
      })
    : undefined;

  const shouldDisplaySubStepObject =
    shouldDisplayRecordObjects &&
    displayedSubStepObjectDisplay?.isSelectable === true;

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
            {specialItems.map((specialItem) => (
              <Dropdown.OptionItem
                key={specialItem.id}
                onSelect={() => handleSelectSpecialItem(specialItem)}
                hasSubmenu={false}
                description={specialItem.contextualText}
                startIcon={
                  <SelectOptionIcon Icon={getIcon(specialItem.iconName)} />
                }
              >
                {specialItem.label}
              </Dropdown.OptionItem>
            ))}
            {shouldDisplaySubStepObject && (
              <Dropdown.OptionItem
                onSelect={handleSelectObject}
                hasSubmenu={false}
                description={t`Pick a ${displayedSubStepObjectDisplay?.label} record`}
                startIcon={
                  <SelectOptionIcon
                    Icon={getIcon(displayedSubStepObjectDisplay?.icon)}
                    color={displayedSubStepObjectDisplay?.iconColor}
                  />
                }
              >
                {displayedSubStepObjectDisplay?.label ?? ''}
              </Dropdown.OptionItem>
            )}
            {isNonEmptyArray(options) &&
              (shouldDisplaySubStepObject || isNonEmptyArray(specialItems)) && (
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
