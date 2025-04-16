/* eslint-disable project-structure/folder-structure */
// ExecuteFlow.ts
import { ChatbotFlowInput } from '@/chatbot/types/chatbotFlow.type';
import { Node } from '@xyflow/react';

import { CondicionalInputHandler } from '@/chatbot/engine/handlers/CondicionalInputHandler';
import { NodeHandler } from './handlers/NodeHandler';
import { TextInputHandler } from './handlers/TextInputHandler';

export class ExecuteFlow {
  private nodes: Node[];
  private currentNodeId?: string;
  private incomingMessage = '';

  private handlers: Record<string, NodeHandler> = {
    textInput: new TextInputHandler(),
    logicInput: new CondicionalInputHandler(),
  };

  constructor(chatbotFlow: ChatbotFlowInput) {
    this.nodes = chatbotFlow.nodes;
    this.currentNodeId = this.findStartNode()?.id;
  }

  private findStartNode(): Node | undefined {
    return this.nodes.find((node) => node.data?.nodeStart);
  }

  private findNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.id === id);
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

      if (!nextNodeId) break;

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

      if (!nextNodeId) break;

      this.currentNodeId = nextNodeId;
    }

    console.log(trace);
  }

  public setIncomingMessage(input: string) {
    this.incomingMessage = input;
  }
}
