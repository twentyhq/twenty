import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useVariableDropdown } from '@/workflow/workflow-variables/hooks/useVariableDropdown';
import { isIteratorOutputSchema } from '@/workflow/workflow-variables/types/guards/isIteratorOutputSchema';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getStepItemIcon } from '@/workflow/workflow-variables/utils/getStepItemIcon';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowVariablesDropdownStepItemsProps = {
  step: StepOutputSchemaV2;
  onSelect: (value: string) => void;
  onBack: () => void;
  shouldDisplayRecordObjects: boolean;
  objectNameSingularsToSelect?: string[];
};

export const WorkflowVariablesDropdownStepItems = ({
  step,
  onSelect,
  onBack,
  shouldDisplayRecordObjects,
  objectNameSingularsToSelect,
}: WorkflowVariablesDropdownStepItemsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();
  const {
    searchInputValue,
    setSearchInputValue,
    handleSelectField,
    goBack,
    filteredOptions,
    currentPath,
  } = useVariableDropdown({
    step,
    onSelect,
    onBack,
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

  // The iterator exposes the element currently being iterated on as `currentItem`.
  // When it is an object we let the user select the whole item, not only one of its fields.
  const iteratorCurrentItemNode = isIteratorOutputSchema(
    step.type,
    step.outputSchema,
  )
    ? step.outputSchema.currentItem
    : undefined;

  const isViewingIteratorCurrentItem =
    isDefined(iteratorCurrentItemNode) &&
    !iteratorCurrentItemNode.isLeaf &&
    currentPath.length === 1 &&
    currentPath[0] === 'currentItem';

  const isWholeItemFoundThroughSearch = isDefined(searchInputValue)
    ? (iteratorCurrentItemNode?.label
        ?.toLowerCase()
        .includes(searchInputValue.toLowerCase()) ?? false)
    : true;

  const shouldDisplayWholeIteratorItem =
    isViewingIteratorCurrentItem && isWholeItemFoundThroughSearch;

  const handleSelectWholeIteratorItem = () => {
    onSelect(
      getVariableTemplateFromPath({
        stepId: step.id,
        path: currentPath,
      }),
    );
  };

  const displayedSubStepObject = getDisplayedSubStepObject();

  const displayedSubStepObjectMetadata = isDefined(displayedSubStepObject)
    ? objectMetadataItems.find(
        (item) => item.id === displayedSubStepObject?.objectMetadataId,
      )
    : undefined;

  const isObjectFoundThroughSearch = isDefined(searchInputValue)
    ? isDefined(displayedSubStepObject?.label) &&
      displayedSubStepObject?.label
        .toLowerCase()
        .includes(searchInputValue.toLowerCase())
    : true;

  const objectLabel = displayedSubStepObjectMetadata?.labelSingular;

  const isSubStepObjectSelectable =
    !isDefined(objectNameSingularsToSelect) ||
    (isDefined(displayedSubStepObjectMetadata) &&
      objectNameSingularsToSelect.includes(
        displayedSubStepObjectMetadata.nameSingular,
      ));

  const shouldDisplaySubStepObject =
    shouldDisplayRecordObjects &&
    isObjectFoundThroughSearch &&
    isSubStepObjectSelectable;

  const displayedSubStepObjectIconProps = isDefined(
    displayedSubStepObjectMetadata,
  )
    ? getSelectIconPropsFromObjectMetadataItem(displayedSubStepObjectMetadata)
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
        {shouldDisplayWholeIteratorItem && (
          <MenuItemSelect
            selected={false}
            focused={false}
            onClick={handleSelectWholeIteratorItem}
            text={iteratorCurrentItemNode?.label ?? ''}
            hasSubMenu={false}
            LeftIcon={getIcon(iteratorCurrentItemNode?.icon ?? 'IconBraces')}
            contextualText={t`Use the whole item`}
          />
        )}
        {shouldDisplaySubStepObject && (
          <MenuItemSelect
            selected={false}
            focused={false}
            onClick={handleSelectObject}
            text={objectLabel || ''}
            hasSubMenu={false}
            LeftIcon={displayedSubStepObjectIconProps?.Icon}
            leftIconColor={displayedSubStepObjectIconProps?.iconThemeColor}
            contextualText={t`Pick a ${objectLabel} record`}
          />
        )}
        {filteredOptions.length > 0 &&
          (shouldDisplaySubStepObject || shouldDisplayWholeIteratorItem) && (
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
