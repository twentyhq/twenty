import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { type StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';

import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useWorkflowVersionIdOrThrow } from '@/workflow/hooks/useWorkflowVersionIdOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { getStepFilterOperands } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/getStepFilterOperands';
import { useVariableDropdown } from '@/workflow/workflow-variables/hooks/useVariableDropdown';
import { extractRawVariableNamePart } from '@/workflow/workflow-variables/utils/extractRawVariableNamePart';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { useLingui } from '@lingui/react/macro';
import { useRecoilCallback } from 'recoil';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowDropdownStepOutputItemsProps = {
  stepFilter: StepFilter;
  step: StepOutputSchema;
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
          searchVariableThroughOutputSchema({
            stepOutputSchema: currentStepOutputSchema,
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

    if (!isRecordOutputSchema(currentSubStep)) {
      return;
    }

    return currentSubStep.object;
  };

  const handleSelectObject = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (!isRecordOutputSchema(currentSubStep)) {
      return;
    }

    updateStepFilter({
      rawVariableName: getVariableTemplateFromPath({
        stepId: step.id,
        path: [...currentPath, currentSubStep.object.fieldIdName],
      }),
      isFullRecord: true,
    });
    onSelect();
  };

  const displayedSubStepObject = getDisplayedSubStepObject();

  const shouldDisplaySubStepObject = searchInputValue
    ? displayedSubStepObject?.label &&
      displayedSubStepObject.label
        .toLowerCase()
        .includes(searchInputValue.toLowerCase())
    : true;

  const shouldDisplayObject =
    shouldDisplaySubStepObject && displayedSubStepObject?.label;
  const nameSingular = displayedSubStepObject?.nameSingular;

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
        {shouldDisplayObject && (
          <MenuItemSelect
            selected={false}
            focused={false}
            onClick={handleSelectObject}
            text={displayedSubStepObject?.label || ''}
            hasSubMenu={false}
            LeftIcon={
              displayedSubStepObject.icon
                ? getIcon(displayedSubStepObject.icon)
                : undefined
            }
            contextualText={t`Pick a ${nameSingular} record`}
          />
        )}
        {filteredOptions.length > 0 && shouldDisplayObject && (
          <DropdownMenuSeparator />
        )}
        {filteredOptions.map(([key, subStep]) => (
          <MenuItemSelect
            key={key}
            selected={false}
            focused={false}
            onClick={() => handleSelectField(key)}
            text={subStep.label || key}
            hasSubMenu={!subStep.isLeaf}
            LeftIcon={subStep.icon ? getIcon(subStep.icon) : undefined}
            contextualText={
              subStep.isLeaf ? subStep?.value?.toString() : undefined
            }
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
