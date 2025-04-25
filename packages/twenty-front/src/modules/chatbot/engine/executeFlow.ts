/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { ChatbotFlowInput } from '@/chatbot/types/chatbotFlow.type';
import { Node } from '@xyflow/react';

import { SendMessageInput } from '@/chat/call-center/types/SendMessage';
import { CondicionalInputHandler } from '@/chatbot/engine/handlers/CondicionalInputHandler';
import { LogicData } from '@/chatbot/types/LogicNodeDataType';
import { NodeHandler } from './handlers/NodeHandler';
import { TextInputHandler } from './handlers/TextInputHandler';

export class ExecuteFlow {
  private nodes: Node[];
  private currentNodeId?: string;
  private incomingMessage = '';
  private handlers: Record<string, NodeHandler>;
  private onFinish?: (finalNode: Node, matchedInputs?: string[]) => void;
  private chosenGroupInputs: string[] = [];

  constructor(
    chatbotFlow: ChatbotFlowInput,
    sendMessage: (input: SendMessageInput) => void,
    integrationId: string,
    recipient: string,
    onFinish?: (finalNode: Node, matchedInputs?: string[]) => void,
  ) {
    this.nodes = chatbotFlow.nodes;
    this.currentNodeId = this.findStartNode()?.id;

    this.handlers = {
      textInput: new TextInputHandler(sendMessage, integrationId, recipient),
      logicInput: new CondicionalInputHandler(),
    };

    this.onFinish = onFinish;
  }

  private findStartNode(): Node | undefined {
    return this.nodes.find((node) => node.data?.nodeStart);
  }

  private findNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.id === id);
  }

  public setIncomingMessage(input: string) {
    this.incomingMessage = input;
  }

  public runFlow(): void {
    while (this.currentNodeId) {
      const currentNode = this.findNodeById(this.currentNodeId);

      if (!currentNode || typeof currentNode.type !== 'string') break;

      const handler =
        this.handlers[currentNode.type as keyof typeof this.handlers];

      if (!handler) break;

      const nextNodeId = handler.process(currentNode, {
        incomingMessage: this.incomingMessage,
      });

      if (currentNode.type === 'logicInput' && nextNodeId) {
        const logic = (currentNode.data as { logic: LogicData }).logic;
        const { logicNodeData } = logic;

        const matchedGroup = logicNodeData.find((group) =>
          group.some((item) => item.outgoingNodeId === nextNodeId),
        );

        if (matchedGroup) {
          this.chosenGroupInputs = matchedGroup.map((item) => item.inputText);
        }
      }

      if (!nextNodeId) {
        if (this.onFinish && currentNode.type === 'textInput') {
          this.onFinish(currentNode, this.chosenGroupInputs);
        }
        break;
      }

      this.currentNodeId = nextNodeId;
    }
  }

  public runFlowWithLog() {
    const trace: string[] = [];

    console.log('User input: ', this.incomingMessage);

    while (this.currentNodeId) {
      const currentNode = this.findNodeById(this.currentNodeId);

      if (!currentNode || typeof currentNode.type !== 'string') {
        trace.push(`Node inválido ou tipo indefinido: ${this.currentNodeId}`);
        break;
      }

      trace.push(
        `Processando node ${currentNode.id} (tipo: ${currentNode.type})`,
      );

      const handler =
        this.handlers[currentNode.type as keyof typeof this.handlers];

      if (!handler) {
        trace.push(`Handler não encontrado para tipo: ${currentNode.type}`);
        break;
      }

      const nextNodeId = handler.process(currentNode, {
        incomingMessage: this.incomingMessage,
      });

      if (currentNode.type === 'logicInput' && nextNodeId) {
        const logic = (currentNode.data as { logic: LogicData }).logic;
        const { logicNodeData } = logic;

        const matchedGroup = logicNodeData.find((group) =>
          group.some((item) => item.outgoingNodeId === nextNodeId),
        );

        if (matchedGroup) {
          this.chosenGroupInputs = matchedGroup.map((item) => item.inputText);
        }
      }

      if (!nextNodeId) {
        if (this.onFinish && currentNode.type === 'textInput') {
          this.onFinish(currentNode, this.chosenGroupInputs);
        }
        break;
      }

      this.currentNodeId = nextNodeId;
    }

    console.log(trace);
  }
}
