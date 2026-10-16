import { type Edge } from '@xyflow/react';
import { doNotTranslate, isDefined } from 'twenty-shared/utils';

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
        doNotTranslate(
          'sourceHandle and targetHandle must be defined on the edge.',
        ),
      );
    }
  };
