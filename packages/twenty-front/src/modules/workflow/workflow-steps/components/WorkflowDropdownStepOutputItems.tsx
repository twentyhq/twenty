import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useWorkflowVersionIdOrThrow } from '@/workflow/hooks/useWorkflowVersionIdOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';
import { useVariableDropdown } from '@/workflow/workflow-variables/hooks/useVariableDropdown';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getStepItemIcon } from '@/workflow/workflow-variables/utils/getStepItemIcon';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { searchVariableThroughOutputSchemaV2 } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchemaV2';
import { useLingui } from '@lingui/react/macro';
import { useRecoilCallback } from 'recoil';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { extractRawVariableNamePart } from 'twenty-shared/workflow';
import {
  IconChevronLeft,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowDropdownStepOutputItemsProps = {
  stepFilter: StepFilter;
  step: StepOutputSchemaV2;
  onSelect: () => void;
  onBack: () => void;
};

export const WorkflowDropdownStepOutputItems = ({
  stepFilter,
  step,
  onSelect,
  onBack,
}: WorkflowDropdownStepOutputItemsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();
  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const workflowVersionId = useWorkflowVersionIdOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();

  const updateStepFilter = useRecoilCallback(
    ({ snapshot }) =>
      ({
        rawVariableName,
        isFullRecord,
      }: {
        rawVariableName: string;
        isFullRecord: boolean;
      }) => {
        const stepId = extractRawVariableNamePart({
          rawVariableName,
          part: 'stepId',
        });
        const [currentStepOutputSchema] = snapshot
          .getLoadable(
            stepsOutputSchemaFamilySelector({
              workflowVersionId,
              stepIds: [stepId],
            }),
          )
          .getValue();

        const { variableType, fieldMetadataId, compositeFieldSubFieldName } =
          searchVariableThroughOutputSchemaV2({
            stepOutputSchema: currentStepOutputSchema,
            stepType: step.type,
            rawVariableName,
            isFullRecord: false,
          });

        const { fieldMetadataItem: filterFieldMetadataItem } = isDefined(
          fieldMetadataId,
        )
          ? getFieldMetadataItemByIdOrThrow(fieldMetadataId)
          : { fieldMetadataItem: undefined };

        const filterType = isDefined(fieldMetadataId)
          ? (filterFieldMetadataItem?.type ?? 'unknown')
          : variableType;

        const availableOperandsForFilter = getStepFilterOperands({
          filterType,
          subFieldName: compositeFieldSubFieldName,
        });
        const defaultOperand = availableOperandsForFilter[0];

        upsertStepFilterSettings({
          stepFilterToUpsert: {
            ...stepFilter,
            stepOutputKey: rawVariableName,
            isFullRecord,
            type: filterType ?? 'unknown',
            value: '',
            fieldMetadataId,
            compositeFieldSubFieldName,
            operand: defaultOperand,
          },
        });
      },
    [
      workflowVersionId,
      step.type,
      getFieldMetadataItemByIdOrThrow,
      upsertStepFilterSettings,
      stepFilter,
    ],
  );

  const handleStepFilterFieldSelect = (key: string) => {
    updateStepFilter({
      rawVariableName: key,
      isFullRecord: false,
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

    updateStepFilter({
      rawVariableName: getVariableTemplateFromPath({
        stepId: step.id,
        path: [...currentPath, 'id'],
      }),
      isFullRecord: true,
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
            LeftIcon={
              subStepObjectMetadataItem?.icon
                ? getIcon(subStepObjectMetadataItem.icon)
                : undefined
            }
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
