import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type LinkOutputSchema } from '@/workflow/workflow-variables/types/LinkOutputSchema';
import { type FieldOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/types/guards/isLinkOutputSchema';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';

type UseVariableDropdownProps = {
  step: StepOutputSchemaV2;
  onSelect: (value: string) => void;
  onBack: () => void;
};

type UseVariableDropdownReturn = {
  currentPath: string[];
  searchInputValue: string;
  setSearchInputValue: (value: string) => void;
  handleSelectField: (key: string) => void;
  goBack: () => void;
  // TODO: fix typing here
  filteredOptions: [string, any][];
};

export const useVariableDropdown = ({
  step,
  onSelect,
  onBack,
}: UseVariableDropdownProps): UseVariableDropdownReturn => {
  const { getIcon } = useIcons();

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const setActiveTabId = useSetRecoilComponentState(
    activeTabIdComponentState,
    'workflow-serverless-function-tab-list-component-id',
  );
  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );
  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
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
        onSelect(
          getVariableTemplateFromPath({
            stepId: step.id,
            path: [...currentPath, key],
          }),
        );
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

      setCommandMenuNavigationStack([]);

      openWorkflowEditStepInCommandMenu(
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
    if (currentPath.length === 0) {
      onBack();
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const displayedFields = getDisplayedSubStepFields();
  const options = displayedFields ? Object.entries(displayedFields) : [];

  const filteredOptions = searchInputValue
    ? options.filter(
        ([_, value]) =>
          value.label &&
          value.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  return {
    currentPath,
    searchInputValue,
    setSearchInputValue,
    handleSelectField,
    goBack,
    filteredOptions,
  };
};
