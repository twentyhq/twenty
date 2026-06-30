import { type Edge } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';

type AssertEdgeHasDefinedHandlesOrThrow = (
  edge: Edge,
) => asserts edge is Edge & {
  sourceHandle: string;
  targetHandle: string;
};

export const assertEdgeHasDefinedHandlesOrThrow: AssertEdgeHasDefinedHandlesOrThrow =
  (edge) => {
    if (!isDefined(edge.sourceHandle) || !isDefined(edge.targetHandle)) {
      throw new Error(
        'sourceHandle and targetHandle must be defined on the edge.',
      );
    }
  };
