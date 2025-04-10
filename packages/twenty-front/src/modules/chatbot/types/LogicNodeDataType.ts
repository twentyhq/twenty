export interface LogicNodeData {
  comparison: string;
  inputText: string;
  conditionValue: string;
  outgoingEdgeId?: string;
}

export interface CondicionalState {
  logicNodes: number[];
  logicNodeData: LogicNodeData[][];
}
