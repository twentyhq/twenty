import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useOpenWorkflowEditFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowEditFilterInCommandMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramEdgeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { WorkflowDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBaseEdge';
import { WorkflowDiagramEdgeButtonGroup } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup';
import { WorkflowDiagramEdgeLabel } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabel';
import { WorkflowDiagramEdgeLabelContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabelContainer';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { WorkflowStepFilterCounter } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterCounter';
import { useFilterCounter } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useFilterCounter';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import {
  IconDotsVertical,
  IconFilter,
  IconFilterX,
  IconPlus,
  IconTrash,
} from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowDiagramFilterEdgeEditableProps = WorkflowDiagramEdgeComponentProps;

const assertFilterEdgeDataOrThrow: (
  data: WorkflowDiagramEdgeData | undefined,
) => asserts data is WorkflowDiagramEdgeData & { edgeType: 'filter' } = (
  data: WorkflowDiagramEdgeData | undefined,
) => {
  if (data?.edgeType !== 'filter') {
    throw new Error('Edge data must be of type "filter"');
  }
};

const StyledConfiguredFilterContainer = styled.div`
  height: 26px;
  width: 26px;
  position: relative;
`;

const StyledIconButtonGroup = styled(IconButtonGroup)<{ selected?: boolean }>`
  pointer-events: all;

  ${({ selected, theme }) => {
    if (!selected) return '';
    const colors = getWorkflowDiagramColors({ theme });
    return css`
      background-color: ${colors.selected.background};
      border: 1px solid ${colors.selected.borderColor};
    `;
  }}
`;

export const WorkflowDiagramFilterEdgeEditable = ({
  source,
  sourceHandleId,
  target,
  targetHandleId,
  sourceY,
  sourceX,
  targetY,
  targetX,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramFilterEdgeEditableProps) => {
  assertFilterEdgeDataOrThrow(data);

  const { t, i18n } = useLingui();

  const theme = useTheme();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { deleteStep } = useDeleteStep();
  const { deleteEdge } = useDeleteEdge();
  const { startNodeCreation, isNodeCreationStarted } = useStartNodeCreation();

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const { isEdgeHovered } = useEdgeState();

  const setWorkflowDiagramPanOnDrag = useSetRecoilComponentState(
    workflowDiagramPanOnDragComponentState,
  );

  const nodeCreationStarted = isNodeCreationStarted({
    parentStepId: data.stepId,
    nextStepId: target,
  });

  const workflowSelectedNode = useRecoilComponentValue(
    workflowSelectedNodeComponentState,
  );

  const isFilterNodeSelected =
    isNonEmptyString(data.stepId) && workflowSelectedNode === data.stepId;

  const dropdownId = `${WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}-${source}-${target}`;

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { openWorkflowEditFilterInCommandMenu } =
    useOpenWorkflowEditFilterInCommandMenu();

  const handleFilterButtonClick = () => {
    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    openWorkflowEditFilterInCommandMenu({
      stepId: data.stepId,
      stepName: data.name,
    });
  };

  const handleRemoveFilterButtonClick = async () => {
    closeDropdown(dropdownId);

    await deleteStep(data.stepId);
  };

  const handleAddNodeButtonClick = () => {
    closeDropdown(dropdownId);

    startNodeCreation({
      parentStepId: data.stepId,
      nextStepId: target,
      position: { x: labelX, y: labelY },
    });
  };

  const handleDeleteBranchClick = async () => {
    closeDropdown(dropdownId);

    await deleteEdge({
      source,
      sourceHandle: sourceHandleId,
      target,
      targetHandle: targetHandleId,
    });
  };

  const { filterCounter } = useFilterCounter({ stepId: data.stepId });
  const { unselected } = getWorkflowDiagramColors({ theme });

  return (
    <>
      <WorkflowDiagramBaseEdge
        source={source}
        sourceHandleId={sourceHandleId}
        target={target}
        targetHandleId={targetHandleId}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        {isDefined(data?.labelOptions) && (
          <WorkflowDiagramEdgeLabelContainer
            sourceX={sourceX}
            sourceY={sourceY}
            position={data.labelOptions.position}
          >
            <WorkflowDiagramEdgeLabel label={i18n._(data.labelOptions.label)} />
          </WorkflowDiagramEdgeLabelContainer>
        )}

        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
          labelX={labelX}
          labelY={labelY}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer shouldDisplay>
            <StyledConfiguredFilterContainer>
              <WorkflowStepFilterCounter
                backgroundColor={unselected.tagBackground}
                textColor={theme.font.color.inverted}
                counter={filterCounter}
              />
              {isEdgeHovered({
                source,
                target,
                sourceHandle: sourceHandleId,
                targetHandle: targetHandleId,
              }) ||
              isDropdownOpen ||
              nodeCreationStarted ? (
                <WorkflowDiagramEdgeButtonGroup
                  iconButtons={[
                    {
                      Icon: IconFilter,
                      onClick: handleFilterButtonClick,
                    },
                    {
                      Icon: IconDotsVertical,
                      onClick: () => {
                        openDropdown({
                          dropdownComponentInstanceIdFromProps: dropdownId,
                        });
                      },
                    },
                  ]}
                  selected={isFilterNodeSelected}
                />
              ) : (
                <StyledIconButtonGroup
                  className="nodrag nopan"
                  iconButtons={[
                    {
                      Icon: IconFilter,
                      onClick: handleFilterButtonClick,
                    },
                  ]}
                  selected={isFilterNodeSelected}
                />
              )}
            </StyledConfiguredFilterContainer>

            <Dropdown
              dropdownId={dropdownId}
              clickableComponent={<div></div>}
              data-select-disable
              dropdownPlacement="bottom-start"
              dropdownStrategy="absolute"
              dropdownOffset={{
                x: 24,
                y: 4,
              }}
              onOpen={() => {
                setWorkflowDiagramPanOnDrag(false);
              }}
              onClose={() => {
                setWorkflowDiagramPanOnDrag(true);
              }}
              dropdownComponents={
                <DropdownContent
                  widthInPixels={GenericDropdownContentWidth.Narrow}
                >
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      text={t`Remove filter`}
                      LeftIcon={IconFilterX}
                      onClick={handleRemoveFilterButtonClick}
                    />
                    <MenuItem
                      text={t`Add Node`}
                      LeftIcon={IconPlus}
                      onClick={handleAddNodeButtonClick}
                    />
                    <MenuItem
                      text={t`Delete branch`}
                      LeftIcon={IconTrash}
                      onClick={handleDeleteBranchClick}
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
