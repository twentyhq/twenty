import { styled } from '@linaria/react';

import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import {
  CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_LABEL,
  WORKFLOWS_INDEX_PATH,
} from '@/workflow/constants/workflowTemplateNavigation';
import { Tag } from 'twenty-ui/components';
import {
  type IconComponent,
  IconChevronDown,
  IconChevronUp,
  IconCode,
  IconDotsVertical,
  IconFilter,
  IconHeart,
  IconPlayerPause,
  IconPlug,
  IconPlus,
  IconRepeat,
  IconSearch,
  IconSitemap,
} from 'twenty-ui/display';
import { Button, LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowTemplateNodeDefinition = {
  x: number;
  y: number;
  width: number;
  label: 'Trigger' | 'Action';
  title: string;
  Icon: IconComponent;
  iconColor: string;
  showTopHandle?: boolean;
  showBottomHandle?: boolean;
};

type WorkflowTemplateNodeProps = WorkflowTemplateNodeDefinition;

type WorkflowTemplateBranchLabel = {
  x: number;
  y: number;
  text: string;
};

const CANVAS_WIDTH = 1480;
const CANVAS_HEIGHT = 1260;
const NODE_HEIGHT = 64;

const workflowTemplateNodes: WorkflowTemplateNodeDefinition[] = [
  {
    x: 370,
    y: 80,
    width: 238,
    label: 'Trigger',
    title: 'Record is created or updated',
    Icon: IconPlug,
    iconColor: themeCssVariables.color.blue,
    showBottomHandle: true,
  },
  {
    x: 620,
    y: 210,
    width: 220,
    label: 'Action',
    title: 'Is this a personal email?',
    Icon: IconCode,
    iconColor: themeCssVariables.color.red,
    showTopHandle: true,
    showBottomHandle: true,
  },
  {
    x: 640,
    y: 340,
    width: 180,
    label: 'Action',
    title: 'If business email',
    Icon: IconFilter,
    iconColor: themeCssVariables.font.color.secondary,
    showTopHandle: true,
    showBottomHandle: true,
  },
  {
    x: 620,
    y: 470,
    width: 220,
    label: 'Action',
    title: 'Extract domain from email',
    Icon: IconCode,
    iconColor: themeCssVariables.color.red,
    showTopHandle: true,
    showBottomHandle: true,
  },
  {
    x: 640,
    y: 600,
    width: 180,
    label: 'Action',
    title: 'Search Company',
    Icon: IconSearch,
    iconColor: themeCssVariables.font.color.secondary,
    showTopHandle: true,
    showBottomHandle: true,
  },
  {
    x: 610,
    y: 730,
    width: 240,
    label: 'Action',
    title: 'Find exact company match',
    Icon: IconCode,
    iconColor: themeCssVariables.color.red,
    showTopHandle: true,
    showBottomHandle: true,
  },
  {
    x: 600,
    y: 860,
    width: 260,
    label: 'Action',
    title: 'If a company already exists',
    Icon: IconSitemap,
    iconColor: themeCssVariables.font.color.secondary,
    showTopHandle: true,
    showBottomHandle: true,
  },
  {
    x: 370,
    y: 990,
    width: 240,
    label: 'Action',
    title: 'Attach person to existing company',
    Icon: IconRepeat,
    iconColor: themeCssVariables.font.color.secondary,
    showTopHandle: true,
  },
  {
    x: 840,
    y: 990,
    width: 220,
    label: 'Action',
    title: 'Create a new company',
    Icon: IconPlus,
    iconColor: themeCssVariables.font.color.secondary,
    showTopHandle: true,
    showBottomHandle: true,
  },
  {
    x: 850,
    y: 1120,
    width: 240,
    label: 'Action',
    title: 'Attach person to this company',
    Icon: IconRepeat,
    iconColor: themeCssVariables.font.color.secondary,
    showTopHandle: true,
  },
];

const workflowTemplateEdges = [
  'M489 144 C489 178 730 174 730 210',
  'M730 274 L730 340',
  'M730 404 L730 470',
  'M730 534 L730 600',
  'M730 664 L730 730',
  'M730 794 L730 860',
  'M730 924 C730 954 534 956 490 990',
  'M730 924 C730 956 916 956 950 990',
  'M950 1054 C950 1082 970 1090 970 1120',
];

const workflowTemplateBranchLabels: WorkflowTemplateBranchLabel[] = [
  { x: 566, y: 944, text: 'if' },
  { x: 820, y: 944, text: 'else' },
];

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeaderIconButtons = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledHeaderActionButtons = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCanvasViewport = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
  width: 100%;
`;

const StyledCanvas = styled.div`
  background-color: #fffdfa;
  background-image: radial-gradient(
    circle,
    rgba(195, 156, 122, 0.28) 1.1px,
    transparent 1.2px
  );
  background-position: 10px 10px;
  background-size: 20px 20px;
  box-sizing: border-box;
  min-height: ${CANVAS_HEIGHT}px;
  min-width: ${CANVAS_WIDTH}px;
  padding: ${themeCssVariables.spacing[3]};
  position: relative;
  width: ${CANVAS_WIDTH}px;
`;

const StyledCanvasOverlay = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
`;

const StyledActiveTag = styled.div`
  left: ${themeCssVariables.spacing[3]};
  position: absolute;
  top: ${themeCssVariables.spacing[3]};
  z-index: 2;
`;

const StyledNode = styled.div`
  align-items: stretch;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${NODE_HEIGHT}px;
  left: 0;
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  top: 0;
  z-index: 1;
`;

const StyledNodeIconContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 0 0 auto;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledNodeContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

const StyledNodeLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.2;
`;

const StyledNodeTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNodeHandle = styled.div<{ $position: 'top' | 'bottom' }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 999px;
  height: 8px;
  left: calc(50% - 4px);
  position: absolute;
  width: 8px;
  ${({ $position }) => ($position === 'top' ? 'top: -5px;' : 'bottom: -5px;')}
`;

const StyledBranchLabel = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 22px;
  justify-content: center;
  min-width: 24px;
  padding: 0 ${themeCssVariables.spacing[1]};
  position: absolute;
  z-index: 2;
`;

const WorkflowTemplateNode = ({
  x,
  y,
  width,
  label,
  title,
  Icon,
  iconColor,
  showTopHandle,
  showBottomHandle,
}: WorkflowTemplateNodeProps) => {
  return (
    <StyledNode style={{ left: x, top: y, width }}>
      {showTopHandle ? <StyledNodeHandle $position="top" /> : null}
      {showBottomHandle ? <StyledNodeHandle $position="bottom" /> : null}
      <StyledNodeIconContainer>
        <Icon color={iconColor} size={16} stroke={1.8} />
      </StyledNodeIconContainer>
      <StyledNodeContent>
        <StyledNodeLabel>{label}</StyledNodeLabel>
        <StyledNodeTitle>{title}</StyledNodeTitle>
      </StyledNodeContent>
    </StyledNode>
  );
};

export const CreateCompanyWhenAddingANewPersonWorkflowPage = () => {
  return (
    <PageContainer>
      <PageHeader
        title={
          <Breadcrumb
            links={[
              { children: 'Workflows', href: WORKFLOWS_INDEX_PATH },
              {
                children: `${CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_LABEL} (0/2)`,
              },
            ]}
          />
        }
      >
        <StyledHeaderActions>
          <StyledHeaderIconButtons>
            <LightIconButton Icon={IconChevronDown} accent="tertiary" />
            <LightIconButton Icon={IconChevronUp} accent="tertiary" />
            <LightIconButton Icon={IconHeart} accent="tertiary" />
          </StyledHeaderIconButtons>
          <StyledHeaderActionButtons>
            <Button
              title="Deactivate"
              Icon={IconPlayerPause}
              size="small"
              variant="primary"
            />
            <Button
              title="See Runs"
              Icon={IconRepeat}
              size="small"
              variant="primary"
            />
            <Button
              title="Add a Node"
              Icon={IconPlus}
              size="small"
              variant="primary"
            />
            <Button
              title="More"
              Icon={IconDotsVertical}
              size="small"
              variant="primary"
            />
          </StyledHeaderActionButtons>
        </StyledHeaderActions>
      </PageHeader>
      <PageBody>
        <StyledCanvasViewport>
          <StyledCanvas>
            <StyledActiveTag>
              <Tag color="green" text="Active" />
            </StyledActiveTag>
            <StyledCanvasOverlay
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              aria-hidden
            >
              <defs>
                <marker
                  id="workflow-template-arrow"
                  markerHeight="8"
                  markerWidth="8"
                  orient="auto"
                  refX="7"
                  refY="4"
                >
                  <path d="M0 0 L8 4 L0 8 Z" fill="#d8d2cb" />
                </marker>
              </defs>
              {workflowTemplateEdges.map((path) => (
                <path
                  key={path}
                  d={path}
                  fill="none"
                  markerEnd="url(#workflow-template-arrow)"
                  stroke="#d8d2cb"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              ))}
            </StyledCanvasOverlay>
            {workflowTemplateNodes.map((node) => (
              <WorkflowTemplateNode
                key={`${node.title}-${node.x}-${node.y}`}
                {...node}
              />
            ))}
            {workflowTemplateBranchLabels.map((label) => (
              <StyledBranchLabel
                key={`${label.text}-${label.x}-${label.y}`}
                style={{ left: label.x, top: label.y }}
              >
                {label.text}
              </StyledBranchLabel>
            ))}
          </StyledCanvas>
        </StyledCanvasViewport>
      </PageBody>
    </PageContainer>
  );
};
