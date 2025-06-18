import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import {
  BaseOutputSchema,
  LinkOutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowDiagramTriggerNodeSelectionComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramTriggerNodeSelectionComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/utils/isLinkOutputSchema';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowVariablesDropdownObjectItemsProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export const WorkflowVariablesDropdownObjectItems = ({
  step,
  onSelect,
  onBack,
}: WorkflowVariablesDropdownObjectItemsProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const { getIcon } = useIcons();
  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );
  const setActiveTabId = useSetRecoilComponentStateV2(
    activeTabIdComponentState,
    'workflow-serverless-function-tab-list-component-id',
  );
  const setWorkflowDiagramTriggerNodeSelection = useSetRecoilComponentStateV2(
    workflowDiagramTriggerNodeSelectionComponentState,
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

    onSelect(
      `{{${step.id}.${[...currentPath, currentSubStep.object.fieldIdName].join('.')}}}`,
    );
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
      setWorkflowSelectedNode(step.id);
      setWorkflowDiagramTriggerNodeSelection(step.id);
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

  const displayedSubStepObject = getDisplayedSubStepObject();

  const shouldDisplaySubStepObject = searchInputValue
    ? displayedSubStepObject?.label &&
      displayedSubStepObject.label
        .toLowerCase()
        .includes(searchInputValue.toLowerCase())
    : true;

  const displayedFields = getDisplayedSubStepFields();
  const options = displayedFields ? Object.entries(displayedFields) : [];

  const filteredOptions = searchInputValue
    ? options.filter(
        ([_, value]) =>
          value.label &&
          value.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

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
        {filteredOptions.map(([key, value]) => (
          <MenuItemSelect
            key={key}
            selected={false}
            focused={false}
            onClick={() => handleSelectField(key)}
            text={value.label || key}
            hasSubMenu={!value.isLeaf}
            LeftIcon={value.icon ? getIcon(value.icon) : undefined}
            contextualText={value.isLeaf ? value?.value?.toString() : undefined}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
