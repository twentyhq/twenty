import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useUpdateStepFilterFromVariable } from '@/workflow/workflow-steps/filters/hooks/useUpdateStepFilterFromVariable';
import { useVariableDropdown } from '@/workflow/workflow-variables/hooks/useVariableDropdown';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getStepItemIcon } from '@/workflow/workflow-variables/utils/getStepItemIcon';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
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
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();

  const { updateStepFilterFromVariable } = useUpdateStepFilterFromVariable({
    stepFilter,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const handleStepFilterFieldSelect = (key: string) => {
    updateStepFilterFromVariable({
      rawVariableName: key,
      isFullRecord: false,
      stepType: step.type,
    });
    onSelect();
  };

  const {
    searchInputValue,
    setSearchInputValue,
    handleSelectField,
    goBack,
    filteredOptions,
    currentPath,
  } = useVariableDropdown({
    step,
    initialPath,
    onSelect: handleStepFilterFieldSelect,
    onBack,
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

  const shouldDisplaySubStepObject = searchInputValue
    ? isDefined(subStepObjectMetadataItem) &&
      subStepObjectMetadataItem.labelSingular
        .toLowerCase()
        .includes(searchInputValue.toLowerCase())
    : isDefined(displayedSubStepObject);

  const objectLabel = subStepObjectMetadataItem?.labelSingular;

  const subStepObjectIconProps = isDefined(subStepObjectMetadataItem)
    ? getSelectIconPropsFromObjectMetadataItem(subStepObjectMetadataItem)
    : undefined;

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
        {shouldDisplaySubStepObject && (
          <MenuItemSelect
            selected={false}
            focused={false}
            onClick={handleSelectObject}
            text={objectLabel || ''}
            hasSubMenu={false}
            LeftIcon={subStepObjectIconProps?.Icon}
            leftIconColor={subStepObjectIconProps?.iconThemeColor}
            contextualText={t`Pick a ${objectLabel} record`}
          />
        )}
        {filteredOptions.length > 0 && shouldDisplaySubStepObject && (
          <DropdownMenuSeparator />
        )}
        {filteredOptions.map(([key, subStep]) => {
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
                subStep.isLeaf ? subStep?.value?.toString() : undefined
              }
            />
          );
        })}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
