import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import { type WorkflowVariableSelection } from '@/workflow/workflow-variables/types/WorkflowVariableSelection';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type BaseOutputSchemaV2,
  type InputSchemaPropertyType,
} from 'twenty-shared/workflow';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getWorkflowVariableSelectionFromSearchResult } from '@/workflow/workflow-variables/utils/getWorkflowVariableSelectionFromSearchResult';
import { searchWorkflowVariables } from '@/workflow/workflow-variables/utils/searchWorkflowVariables';

type UseVariableDropdownProps = {
  step: StepOutputSchemaV2;
  initialPath?: string[];
  onSelect: (selection: WorkflowVariableSelection) => void;
  onBack: () => void;
  shouldDisplaySpecialItems?: boolean;
  shouldDisplayRecordObjects?: boolean;
  objectNameSingularsToSelect?: string[];
};

type VariableDropdownOption = {
  isLeaf: boolean;
  label?: string;
  icon?: string;
  type?: InputSchemaPropertyType;
  value?: { toString: () => string } | null;
};

type UseVariableDropdownReturn = {
  currentPath: string[];
  searchInputValue: string;
  setSearchInputValue: (value: string) => void;
  handleSelectField: (key: string) => void;
  isSearching: boolean;
  searchResults: WorkflowVariableSearchResult[];
  handleSelectSearchResult: (result: WorkflowVariableSearchResult) => void;
  goBack: () => void;
  options: Array<[string, VariableDropdownOption]>;
};

export const useVariableDropdown = ({
  step,
  initialPath = [],
  onSelect,
  onBack,
  shouldDisplaySpecialItems,
  shouldDisplayRecordObjects,
  objectNameSingularsToSelect,
}: UseVariableDropdownProps): UseVariableDropdownReturn => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  const [searchInputValue, setSearchInputValue] = useState('');

  const getDisplayedSubStepFields = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (isRecordOutputSchemaV2(currentSubStep)) {
      return currentSubStep.fields;
    }

    if (isBaseOutputSchemaV2(currentSubStep)) {
      return currentSubStep;
    }
  };

  const handleSelectField = (key: string) => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    const handleSelectBaseOutputSchema = (
      baseOutputSchema:
        | BaseOutputSchemaV2
        | Record<string, FieldOutputSchemaV2>,
    ) => {
      if (!baseOutputSchema[key]?.isLeaf) {
        setCurrentPath([...currentPath, key]);
        setSearchInputValue('');
        return;
      }

      onSelect({
        rawVariableName: getVariableTemplateFromPath({
          stepId: step.id,
          path: [...currentPath, key],
        }),
        stepId: step.id,
        isFullRecord: false,
      });
    };

    if (isRecordOutputSchemaV2(currentSubStep)) {
      handleSelectBaseOutputSchema(currentSubStep.fields);
    }

    if (isBaseOutputSchemaV2(currentSubStep)) {
      handleSelectBaseOutputSchema(currentSubStep);
    }
  };

  const goBack = () => {
    setSearchInputValue('');
    if (!isNonEmptyArray(currentPath)) {
      onBack();
      return;
    }

    setCurrentPath(currentPath.slice(0, -1));
  };

  const displayedFields = getDisplayedSubStepFields();
  const options = isDefined(displayedFields)
    ? Object.entries(displayedFields)
    : [];

  const isSearching = isNonEmptyString(searchInputValue.trim());
  const searchResults = searchWorkflowVariables({
    steps: [step],
    currentPath,
    searchInputValue,
    shouldDisplaySpecialItems,
    shouldDisplayRecordObjects,
    objectNameSingularsToSelect,
    objectMetadataItems,
  });

  const handleSelectSearchResult = (result: WorkflowVariableSearchResult) => {
    if (result.isLeaf) {
      onSelect(getWorkflowVariableSelectionFromSearchResult(result));
      return;
    }

    setCurrentPath(result.path);
    setSearchInputValue('');
  };

  return {
    currentPath,
    searchInputValue,
    setSearchInputValue,
    handleSelectField,
    goBack,
    options,
    isSearching,
    searchResults,
    handleSelectSearchResult,
  };
};
