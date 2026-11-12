import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

type NodePosition = { x: number; y: number };

export const applyPositionsToFlow = <
  TFlow extends {
    trigger: { position?: NodePosition | null } | null;
    steps: { id: string; position?: NodePosition | null }[] | null;
  },
>({
  flow,
  positions,
}: {
  flow: TFlow | undefined;
  positions: { id: string; position: NodePosition | undefined }[];
}): TFlow | undefined => {
  if (!isDefined(flow)) {
    return flow;
  }

  const positionById = new Map(
    positions.map(({ id, position }) => [id, position]),
  );

  return {
    ...flow,
    trigger:
      isDefined(flow.trigger) && positionById.has(TRIGGER_STEP_ID)
        ? { ...flow.trigger, position: positionById.get(TRIGGER_STEP_ID) }
        : flow.trigger,
    steps:
      flow.steps?.map((step) =>
        positionById.has(step.id)
          ? { ...step, position: positionById.get(step.id) }
          : step,
      ) ?? null,
  };
};
