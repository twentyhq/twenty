/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { SendMessageInput } from '@/chat/call-center/types/SendMessage';
import { MessageType } from '@/chat/types/MessageType';
import { NewConditionalState } from '@/chatbot/types/LogicNodeDataType';
import { Node } from '@xyflow/react';
import { NodeHandler } from './NodeHandler';

export class CondicionalInputHandler implements NodeHandler {
  private compare(
    actual: string,
    expected: string,
    comparison: string,
  ): boolean {
    switch (comparison) {
      case '==':
        return actual === expected;
      case '!==':
        return actual !== expected;
      case 'contains':
        return actual.includes(expected);
      default:
        return false;
    }
  }

  constructor(
    private sendMessage: (input: SendMessageInput) => void,
    private integrationId: string,
    private recipient: string,
    private chatbotName: string,
    private sectors: { id: string; name: string }[],
  ) {}

  process(node: Node, context: { incomingMessage: string }): string | null {
    const logic = node.data?.logic as NewConditionalState | undefined;

    if (!logic || !logic.logicNodeData) return null;

    const input = context.incomingMessage.trim();

    const prompt = typeof node.data?.text === 'string' ? node.data.text : '';

    if (prompt) {
      this.sendMessage({
        type: MessageType.TEXT,
        message: prompt,
        integrationId: this.integrationId,
        to: this.recipient,
        from: this.chatbotName,
      });
    }

    const optionsList = logic.logicNodeData
      .map((d) => {
        const sector = this.sectors.find((s) => s.id === d.sectorId);
        const name = sector?.name ?? '';

        return `${d.option} - ${name}`;
      })
      .join('\n');

    if (optionsList) {
      this.sendMessage({
        type: MessageType.TEXT,
        message: optionsList,
        integrationId: this.integrationId,
        to: this.recipient,
        from: this.chatbotName,
      });
    }

    for (const d of logic.logicNodeData) {
      const sector = this.sectors.find((s) => s.id === d.sectorId);
      const sectorName = sector?.name.toLowerCase() ?? '';

      const option = d.option.toLowerCase();
      const comparison = d.comparison;
      const condition = d.conditionValue;

      const matchOption = this.compare(input, option, comparison);
      const matchSector = sectorName
        ? this.compare(input, sectorName, comparison)
        : false;

      const matched =
        condition === '||'
          ? matchOption || matchSector
          : matchOption && matchSector;

      if (matched) {
        return d.outgoingNodeId ?? null;
      }
    }

    return null;
  }
}
