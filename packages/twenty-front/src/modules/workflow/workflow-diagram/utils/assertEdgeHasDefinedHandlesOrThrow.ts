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
        // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
        'sourceHandle and targetHandle must be defined on the edge.',
      );
    }
  };
