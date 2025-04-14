/* eslint-disable project-structure/folder-structure */
import { Node } from '@xyflow/react';

export interface NodeHandler {
  process(node: Node, context: { incomingMessage: string }): string | null;
}
