/* eslint-disable project-structure/folder-structure */
import {
  CondicionalState,
  ExtendedLogicNodeData,
} from '@/chatbot/types/LogicNodeDataType';
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

  process(node: Node, context: { incomingMessage: string }): string | null {
    const logic = node.data?.logic as CondicionalState | undefined;

    if (!logic || !logic.logicNodeData) return null;

    const actualInput = context.incomingMessage.toLowerCase().trim();

    for (let i = 0; i < logic.logicNodeData.length; i++) {
      const conditionGroup = logic.logicNodeData[i] as ExtendedLogicNodeData[];

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

      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (groupResult) {
        const nextId = conditionGroup[0]?.outgoingNodeId;
        return typeof nextId === 'string' ? nextId : null;
      }
    }

    return null;
  }
}
