import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
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
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
              <ListItem
                key={specialItem.id}
                focused={false}
                onClick={() => handleSelectSpecialItem(specialItem)}
                role="option"
                aria-selected={false}
                selected={false}
                indicator="check"
                hasSubmenu={false}
                description={specialItem.contextualText}
                startIcon={
                  <SelectOptionIcon Icon={getIcon(specialItem.iconName)} />
                }
              >
                {specialItem.label}
              </ListItem>
            ))}
            {shouldDisplaySubStepObject && (
              <ListItem
                focused={false}
                onClick={handleSelectObject}
                role="option"
                aria-selected={false}
                selected={false}
                indicator="check"
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
              </ListItem>
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
                <ListItem
                  key={key}
                  focused={false}
                  onClick={() => handleSelectField(key)}
                  role="option"
                  aria-selected={false}
                  selected={false}
                  indicator="check"
                  hasSubmenu={!subStep.isLeaf}
                  description={
                    subStep.isLeaf ? subStep.value?.toString() : undefined
                  }
                  startIcon={
                    <SelectOptionIcon
                      Icon={
                        subStep.icon
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
                </ListItem>
              );
            })}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
