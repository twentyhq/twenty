import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
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
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';

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
            {specialItems.map((specialItem) => (
              <MenuItemSelect
                key={specialItem.id}
                selected={false}
                focused={false}
                onClick={() => handleSelectSpecialItem(specialItem)}
                text={specialItem.label}
                hasSubMenu={false}
                LeftIcon={getIcon(specialItem.iconName)}
                contextualText={specialItem.contextualText}
              />
            ))}
            {shouldDisplaySubStepObject && (
              <MenuItemSelect
                selected={false}
                focused={false}
                onClick={handleSelectObject}
                text={displayedSubStepObjectDisplay?.label ?? ''}
                hasSubMenu={false}
                LeftIcon={getIcon(displayedSubStepObjectDisplay?.icon)}
                leftIconColor={displayedSubStepObjectDisplay?.iconColor}
                contextualText={t`Pick a ${displayedSubStepObjectDisplay?.label} record`}
              />
            )}
            {options.length > 0 &&
              (shouldDisplaySubStepObject || specialItems.length > 0) && (
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
