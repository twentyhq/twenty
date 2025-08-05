import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import {
  BaseOutputSchema,
  LinkOutputSchema,
  StepOutputSchema,
} from '../types/StepOutputSchema';
import { getCurrentSubStepFromPath } from '../utils/getCurrentSubStepFromPath';
import { isBaseOutputSchema } from '../utils/isBaseOutputSchema';
import { isLinkOutputSchema } from '../utils/isLinkOutputSchema';
import { isRecordOutputSchema } from '../utils/isRecordOutputSchema';

type UseVariableDropdownProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

type UseVariableDropdownReturn = {
  currentPath: string[];
  searchInputValue: string;
  setSearchInputValue: (value: string) => void;
  handleSelectField: (key: string) => void;
  goBack: () => void;
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

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );
  const setActiveTabId = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
    'workflow-serverless-function-tab-list-component-id',
  );
  const setWorkflowDiagram = useSetRecoilComponentStateV2(
    workflowDiagramComponentState,
  );
  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const getDisplayedSubStepFields = () => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    if (isLinkOutputSchema(currentSubStep)) {
      return { link: currentSubStep.link };
    } else if (isRecordOutputSchema(currentSubStep)) {
      return currentSubStep.fields;
    } else if (isBaseOutputSchema(currentSubStep)) {
      return currentSubStep;
    }
  };

  const handleSelectField = (key: string) => {
    const currentSubStep = getCurrentSubStepFromPath(step, currentPath);

    const handleSelectBaseOutputSchema = (
      baseOutputSchema: BaseOutputSchema,
    ) => {
      if (!baseOutputSchema[key]?.isLeaf) {
        setCurrentPath([...currentPath, key]);
        setSearchInputValue('');
      } else {
        onSelect(`{{${step.id}.${[...currentPath, key].join('.')}}}`);
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
      );

      if (isDefined(linkOutputSchema.link.tab)) {
        setActiveTabId(linkOutputSchema.link.tab);
      }
    };

    if (isLinkOutputSchema(currentSubStep)) {
      handleSelectLinkOutputSchema(currentSubStep);
    } else if (isRecordOutputSchema(currentSubStep)) {
      handleSelectBaseOutputSchema(currentSubStep.fields);
    } else if (isBaseOutputSchema(currentSubStep)) {
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
