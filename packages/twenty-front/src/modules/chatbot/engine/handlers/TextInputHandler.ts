import { SendMessageInput } from '@/chat/call-center/types/SendMessage';
import { MessageType } from '@/chat/types/MessageType';
import { Node } from '@xyflow/react';
import { NodeHandler } from './NodeHandler';

export class TextInputHandler implements NodeHandler {
  constructor(
    private sendMessage: (input: SendMessageInput) => void,
    private integrationId: string,
    private recipient: string,
  ) {}

  process(node: Node): string | null {
    const text = typeof node.data?.text === 'string' ? node.data.text : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (text) {
      const formattedText = text.replace(/\n{2,}/g, '\n\n').trim();

      this.sendMessage({
        integrationId: this.integrationId,
        to: this.recipient,
        type: MessageType.TEXT,
        message: formattedText,
      });
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
