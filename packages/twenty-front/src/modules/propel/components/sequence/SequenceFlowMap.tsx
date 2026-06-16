import '@xyflow/react/dist/style.css';

import { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  type Edge,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { Box } from '@mantine/core';
import {
  type SequenceStepDraft,
  type StepType,
} from '@/propel/types/sequenceEditor';
import { STEP_TYPE_LABEL, flowStepTitle } from '@/propel/lib/sequenceEditorConfig';

// The node-graph canvas the audit named as the ONE reason this surface graduates
// out of the front-component sandbox (React Flow crashes the box — no DOM). Here in
// the real frontend it renders a READ-ONLY map auto-derived from the step list:
//   step 0 → step 1 → … → done, plus a CONDITION step's yes/no branch edges drawn
//   to whatever sibling index they target (the same index wire-format the editor and
//   save-route share). Editing stays in the dense Mantine rail beside it; this is the
//   "see the whole flow at a glance" view, controlled by the rail's state.

const STEP_ACCENT: Record<StepType, string> = {
  SEND_EMAIL: 'var(--mantine-color-blue-6)',
  SEND_WHATSAPP: 'var(--mantine-color-teal-6)',
  WAIT: 'var(--mantine-color-yellow-6)',
  CONDITION: 'var(--mantine-color-violet-6)',
  CREATE_TASK: 'var(--mantine-color-orange-6)',
  EXIT: 'var(--mantine-color-gray-6)',
};

type StepNodeData = {
  index: number;
  step: SequenceStepDraft;
  selected: boolean;
};

// A node typed for React Flow v12's generic Node<Data, type> contract.
type StepFlowNode = Node<StepNodeData, 'step'>;
type DoneFlowNode = Node<Record<string, never>, 'done'>;

const StepNode = ({ data }: NodeProps<StepFlowNode>) => {
  const accent = STEP_ACCENT[data.step.stepType];
  return (
    <Box
      style={{
        width: 184,
        borderRadius: 12,
        border: `1.5px solid ${
          data.selected ? 'var(--mantine-color-red-6)' : accent
        }`,
        background: 'var(--mantine-color-body)',
        boxShadow: data.selected
          ? '0 0 0 3px var(--mantine-color-red-light)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        padding: '10px 12px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: accent, border: 'none', width: 7, height: 7 }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 10,
            fontWeight: 700,
            background: accent,
            color: '#fff',
            flex: 'none',
          }}
        >
          {data.index + 1}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {STEP_TYPE_LABEL[data.step.stepType]}
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--mantine-color-text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {flowStepTitle(data.step, data.index)}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: accent, border: 'none', width: 7, height: 7 }}
      />
    </Box>
  );
};

const DoneNode = (_props: NodeProps<DoneFlowNode>) => (
  <Box
    style={{
      width: 110,
      borderRadius: 999,
      border: '1.5px dashed var(--mantine-color-default-border)',
      background: 'var(--mantine-color-body)',
      padding: '8px 12px',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      style={{
        background: 'var(--mantine-color-dimmed)',
        border: 'none',
        width: 7,
        height: 7,
      }}
    />
    <span
      style={{ fontSize: 11, fontWeight: 700, color: 'var(--mantine-color-dimmed)' }}
    >
      Done
    </span>
  </Box>
);

const nodeTypes = { step: StepNode, done: DoneNode };

export const SequenceFlowMap = ({
  steps,
  selectedIndex,
  onSelect,
}: {
  steps: SequenceStepDraft[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) => {
  const { nodes, edges } = useMemo(() => {
    const ns: Node[] = [];
    const es: Edge[] = [];
    const X = 70;
    const Y_GAP = 116;

    steps.forEach((step, i) => {
      const node: StepFlowNode = {
        id: `s${i}`,
        type: 'step',
        position: { x: X, y: i * Y_GAP },
        data: { index: i, step, selected: selectedIndex === i },
        draggable: false,
        connectable: false,
      };
      ns.push(node);
    });

    // terminal "Done" node below the last step
    const doneId = 'done';
    ns.push({
      id: doneId,
      type: 'done',
      position: { x: X + 38, y: steps.length * Y_GAP },
      data: {},
      draggable: false,
      connectable: false,
    } as DoneFlowNode);

    steps.forEach((step, i) => {
      const from = `s${i}`;
      if (step.stepType === 'CONDITION') {
        // yes/no branch edges, defaulting to "continue in order" (next step) when
        // the branch target is null — exactly how the tick engine falls back.
        const yesTarget =
          step.yesStepIndex != null && steps[step.yesStepIndex]
            ? `s${step.yesStepIndex}`
            : i + 1 < steps.length
              ? `s${i + 1}`
              : doneId;
        const noTarget =
          step.noStepIndex != null && steps[step.noStepIndex]
            ? `s${step.noStepIndex}`
            : i + 1 < steps.length
              ? `s${i + 1}`
              : doneId;
        es.push({
          id: `e${i}-yes`,
          source: from,
          target: yesTarget,
          label: 'yes',
          animated: false,
          style: { stroke: 'var(--mantine-color-teal-6)' },
          labelStyle: { fontSize: 10, fontWeight: 700, fill: 'var(--mantine-color-teal-7)' },
        });
        es.push({
          id: `e${i}-no`,
          source: from,
          target: noTarget,
          label: 'otherwise',
          animated: false,
          style: { stroke: 'var(--mantine-color-gray-5)' },
          labelStyle: { fontSize: 10, fontWeight: 700, fill: 'var(--mantine-color-dimmed)' },
        });
      } else if (step.stepType === 'EXIT' || step.stepType === 'CREATE_TASK') {
        // terminal steps end the journey
        es.push({
          id: `e${i}-end`,
          source: from,
          target: doneId,
          style: { stroke: 'var(--mantine-color-default-border)' },
        });
      } else {
        // linear flow to the next step (or done)
        es.push({
          id: `e${i}-next`,
          source: from,
          target: i + 1 < steps.length ? `s${i + 1}` : doneId,
          style: { stroke: 'var(--mantine-color-default-border)' },
        });
      }
    });

    return { nodes: ns, edges: es };
  }, [steps, selectedIndex]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_event, node) => {
          const data = node.data as Partial<StepNodeData>;
          if (typeof data.index === 'number') onSelect(data.index);
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </ReactFlowProvider>
  );
};
