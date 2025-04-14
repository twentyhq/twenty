/* eslint-disable project-structure/folder-structure */
import { Node } from '@xyflow/react';
import { NodeHandler } from './NodeHandler';

export class TextInputHandler implements NodeHandler {
  process(node: Node): string | null {
    // Remove this log after implementing it in chat
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (node.data?.text) {
      console.log(`Bot: ${node.data.text}`);
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
