import { SendMessageInput } from '@/chat/call-center/types/SendMessage';
import { MessageType } from '@/chat/types/MessageType';
import { Node } from '@xyflow/react';
import { NodeHandler } from './NodeHandler';

export class FileInputHandler implements NodeHandler {
  constructor(
    private sendMessage: (input: SendMessageInput) => void,
    private integrationId: string,
    private recipient: string,
    private chatbotName: string,
  ) {}

  process(node: Node): string | null {
    const file =
      typeof node.data?.fileUrl === 'string' ? node.data.fileUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (file) {
      this.sendMessage({
        integrationId: this.integrationId,
        to: this.recipient,
        type: MessageType.DOCUMENT,
        fileId: file,
        from: this.chatbotName,
      });
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
