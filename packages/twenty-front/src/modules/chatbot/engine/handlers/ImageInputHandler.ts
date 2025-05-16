import { MessageType } from '@/chat/types/MessageType';
import { Node } from '@xyflow/react';
import { NodeHandler } from './NodeHandler';
import { SendMessageType } from '@/chat/call-center/hooks/useSendWhatsappMessages';

export class ImageInputHandler implements NodeHandler {
  constructor(
    private sendMessage: SendMessageType,
    private integrationId: string,
    private recipient: string,
    private chatbotName: string,
  ) {}

  async process(node: Node): Promise<string | null> {
    const image =
      typeof node.data?.imageUrl === 'string' ? node.data.imageUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (image) {
      await this.sendMessage({
        integrationId: this.integrationId,
        to: this.recipient,
        type: MessageType.IMAGE,
        fileId: image,
        from: this.chatbotName,
      });
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
