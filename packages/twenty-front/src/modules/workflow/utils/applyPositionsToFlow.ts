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
  positions: { id: string; position: NodePosition }[];
}): TFlow | undefined => {
  if (!isDefined(flow)) {
    return flow;
  }

  const positionById = new Map(
    positions.map(({ id, position }) => [id, position]),
  );

  const triggerPosition = positionById.get(TRIGGER_STEP_ID);

  return {
    ...flow,
    trigger:
      isDefined(flow.trigger) && isDefined(triggerPosition)
        ? { ...flow.trigger, position: triggerPosition }
        : flow.trigger,
    steps:
      flow.steps?.map((step) => {
        const stepPosition = positionById.get(step.id);

        return isDefined(stepPosition)
          ? { ...step, position: stepPosition }
          : step;
      }) ?? null,
  };
};
