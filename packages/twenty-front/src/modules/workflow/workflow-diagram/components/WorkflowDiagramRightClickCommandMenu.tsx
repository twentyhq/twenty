import styled from '@emotion/styled';
import { workflowDiagramRightClickMenuState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuState';
import { isDefined } from 'twenty-shared/utils';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRef } from 'react';
import { WorkflowDiagramRightClickCommandMenuClickOutsideEffect } from './WorkflowDiagramRightClickCommandMenuClickOutsideEffect';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { IconPlus, IconReorder } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div<{ x: number; y: number }>`
  display: flex;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  position: absolute;
  top: ${({ y }) => `${y}px`};
  left: ${({ x }) => `${x}px`};
  width: 100%;
`;

export const WorkflowDiagramRightClickCommandMenu = () => {
  const { t } = useLingui();
  const rightClickCommandMenuRef = useRef<HTMLDivElement>(null);

  const workflowDiagramRightClickMenu = useRecoilComponentValueV2(
    workflowDiagramRightClickMenuState,
  );

  if (!isDefined(workflowDiagramRightClickMenu)) {
    return;
  }

  return (
    <>
      <StyledContainer
        ref={rightClickCommandMenuRef}
        x={workflowDiagramRightClickMenu.x}
        y={workflowDiagramRightClickMenu.y}
      >
        <SelectableList
          focusId={'right-click-command-menu'}
          selectableListInstanceId={'right-click-command-menu-list'}
          selectableItemIdArray={['add-node']}
        >
          <SelectableListItem itemId={'add-node'}>
            <MenuItem
              text={t`Add node`}
              LeftIcon={IconPlus}
              onClick={(e) => console.log('e', e)}
            />
          </SelectableListItem>
          <SelectableListItem itemId={'tidy-up-workflow'}>
            <MenuItem
              text={t`Tidy up workflow`}
              LeftIcon={IconReorder}
              onClick={(e) => console.log('e', e)}
            />
          </SelectableListItem>
        </SelectableList>
      </StyledContainer>
      <WorkflowDiagramRightClickCommandMenuClickOutsideEffect
        rightClickCommandMenuRef={rightClickCommandMenuRef}
      />
    </>
  );
};
