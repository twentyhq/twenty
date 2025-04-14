/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { ChatbotFlowInput } from '@/chatbot/types/chatbotFlow.type';
import {
  CondicionalState,
  ExtendedLogicNodeData,
} from '@/chatbot/types/LogicNodeDataType';
import { Node } from '@xyflow/react';

type NodeHandler = (node: Node) => boolean;

export class ExecuteFlow {
  private nodes: Node[];
  private currentNodeId?: string;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  private incomingMessage: string = '';

  private handlers: Record<string, NodeHandler> = {
    textInput: this.processTextInput.bind(this),
    logicInput: this.processLogicInput.bind(this),
  };

  constructor(chatbotFlow: ChatbotFlowInput) {
    this.nodes = chatbotFlow.nodes;
    this.currentNodeId = this.findStartNode()?.id;
  }

  private findStartNode(): Node | undefined {
    return this.nodes.find((node) => node.data?.nodeStart === true);
  }

  private findNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.id === id);
  }

  private processTextInput(node: Node): boolean {
    if (node.data?.text) {
      console.log(`Bot: ${node.data.text}`);
    }

    const nextId = node.data?.outgoingNodeId;

    if (typeof nextId === 'string') {
      this.currentNodeId = nextId;
      return true;
    }

    return false;
  }

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
      // case '>':
      //   return parseFloat(actual) > parseFloat(expected);
      // case '<':
      //   return parseFloat(actual) < parseFloat(expected);
      // case '>=':
      //   return parseFloat(actual) >= parseFloat(expected);
      // case '<=':
      //   return parseFloat(actual) <= parseFloat(expected);
      default:
        return false;
    }
  }

  private processLogicInput(node: Node): boolean {
    const logic = node.data?.logic as CondicionalState | undefined;

    if (!logic || !logic.logicNodeData) {
      return false;
    }

    const actualInput = this.incomingMessage.toLowerCase().trim();

    for (let i = 0; i < logic.logicNodeData.length; i++) {
      const conditionGroup = logic.logicNodeData[i] as ExtendedLogicNodeData[];

      if (conditionGroup.length === 0) continue;

      let groupResult: boolean | undefined;

      for (let j = 0; j < conditionGroup.length; j++) {
        const cond = conditionGroup[j];
        const expected = cond.inputText.toLowerCase().trim();
        const result = this.compare(actualInput, expected, cond.comparison);

        if (j === 0) {
          groupResult = result;
        } else {
          const op = cond.conditionValue?.trim() || '&&';
          groupResult =
            op === '||' ? groupResult || result : groupResult && result;
        }
      }

      if (groupResult) {
        const nextId = conditionGroup[0]?.outgoingNodeId;

        if (typeof nextId === 'string') {
          this.currentNodeId = nextId;
          return true;
        }
      }
    }

    return false;
  }

  public runFlowWithLog() {
    const trace: string[] = [];

    while (this.currentNodeId) {
      const currentNode = this.findNodeById(this.currentNodeId);
      if (!currentNode) {
        trace.push(`Node não encontrado: ${this.currentNodeId}`);
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

      const continueFlow = handler(currentNode);
      if (!continueFlow) break;
    }

    console.log(trace);
  }

  public runFlow(): void {
    while (this.currentNodeId) {
      const currentNode = this.findNodeById(this.currentNodeId);
      if (!currentNode) break;

      const handler =
        this.handlers[currentNode.type as keyof typeof this.handlers];
      if (!handler) break;

      const continueFlow = handler(currentNode);
      if (!continueFlow) break;
    }
  }

  public setIncomingMessage(input: string) {
    this.incomingMessage = input;
  }
}
