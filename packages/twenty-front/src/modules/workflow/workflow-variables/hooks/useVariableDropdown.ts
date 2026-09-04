import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowLogicFunctionTabListComponentId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type LinkOutputSchema } from '@/workflow/workflow-variables/types/LinkOutputSchema';
import { type FieldOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type WorkflowVariableSearchResult } from '@/workflow/workflow-variables/types/WorkflowVariableSearchResult';
import { type WorkflowVariableSelection } from '@/workflow/workflow-variables/types/WorkflowVariableSelection';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  type InputSchemaPropertyType,
} from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/icon';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/types/guards/isLinkOutputSchema';
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
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();

  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  const [searchInputValue, setSearchInputValue] = useState('');

  const { openWorkflowEditStepInSidePanel } = useSidePanelWorkflowNavigation();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const setWorkflowSelectedNode = useSetAtomComponentState(
    workflowSelectedNodeComponentState,
  );
  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    useWorkspaceSurfaceScopedComponentInstanceId(
      WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
    ),
  );
  const setWorkflowDiagram = useSetAtomComponentState(
    workflowDiagramComponentState,
  );
  const setSidePanelNavigationStack = useSetAtomState(
    sidePanelNavigationStackState,
  );

  const getDisplayedSubStepFields = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (isLinkOutputSchema(currentSubStep)) {
      return { link: currentSubStep.link };
    } else if (isRecordOutputSchemaV2(currentSubStep)) {
      return currentSubStep.fields;
    } else if (isBaseOutputSchemaV2(currentSubStep)) {
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
      } else {
        onSelect({
          rawVariableName: getVariableTemplateFromPath({
            stepId: step.id,
            path: [...currentPath, key],
          }),
          stepId: step.id,
          isFullRecord: false,
        });
      }
    };

    const handleSelectLinkOutputSchema = (
      linkOutputSchema: LinkOutputSchema,
    ) => {
      if (!isDefined(workflowVisualizerWorkflowId)) {
        throw new Error('Workflow ID must be configured');
      }

      setWorkflowSelectedNode(step.id);

      setWorkflowDiagram((diagram) => {
        if (!isDefined(diagram)) {
          throw new Error('Workflow diagram must be defined');
        }

        return {
          ...diagram,
          nodes: diagram.nodes.map((node) => ({
            ...node,
            selected: node.id === step.id,
          })),
        };
      });

      setSidePanelNavigationStack([]);

      openWorkflowEditStepInSidePanel(
        workflowVisualizerWorkflowId,
        step.name,
        getIcon(step.icon),
        step.id,
      );

      if (isDefined(linkOutputSchema.link.tab)) {
        setActiveTabId(linkOutputSchema.link.tab);
      }
    };

    if (isLinkOutputSchema(currentSubStep)) {
      handleSelectLinkOutputSchema(currentSubStep);
    } else if (isRecordOutputSchemaV2(currentSubStep)) {
      handleSelectBaseOutputSchema(currentSubStep.fields);
    } else if (isBaseOutputSchemaV2(currentSubStep)) {
      handleSelectBaseOutputSchema(currentSubStep);
    }
  };

  const goBack = () => {
    setSearchInputValue('');
    if (currentPath.length === 0) {
      onBack();
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const displayedFields = getDisplayedSubStepFields();
  const options = displayedFields ? Object.entries(displayedFields) : [];

  const isSearching = searchInputValue.trim().length > 0;
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

    if (isLinkOutputSchema(getCurrentSubStepFromPath(step, currentPath))) {
      handleSelectField('link');
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
