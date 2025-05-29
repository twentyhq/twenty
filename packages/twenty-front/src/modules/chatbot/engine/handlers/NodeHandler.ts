import { Node } from '@xyflow/react';

export interface NodeHandler {
  process(
    node: Node,
    context: { incomingMessage: string },
  ): Promise<string | null>;
}
