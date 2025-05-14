import { MessageType } from '@/chat/types/MessageType';
import { Node } from '@xyflow/react';
import { NodeHandler } from './NodeHandler';
import { SendMessageType } from '@/chat/call-center/hooks/useSendWhatsappMessages';

export class TextInputHandler implements NodeHandler {
  constructor(
    private sendMessage: SendMessageType,
    private integrationId: string,
    private recipient: string,
    private chatbotName: string,
  ) {}

  async process(node: Node): Promise<string | null> {
    const text = typeof node.data?.text === 'string' ? node.data.text : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (text) {
      const formattedText = text.replace(/\n{2,}/g, '\n\n').trim();

      await this.sendMessage({
        integrationId: this.integrationId,
        to: this.recipient,
        type: MessageType.TEXT,
        message: formattedText,
        from: this.chatbotName,
      });
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
