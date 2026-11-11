import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

type NodePosition = { x: number; y: number };

export const getFlowPositions = (
  flow:
    | {
        trigger: { position?: NodePosition | null } | null;
        steps: { id: string; position?: NodePosition | null }[] | null;
      }
    | undefined,
): { id: string; position: NodePosition | undefined }[] => [
  { id: TRIGGER_STEP_ID, position: flow?.trigger?.position ?? undefined },
  ...(flow?.steps ?? []).map((step) => ({
    id: step.id,
    position: step.position ?? undefined,
  })),
];
