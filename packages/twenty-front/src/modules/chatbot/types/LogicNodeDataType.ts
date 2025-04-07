export interface LogicNodeData {
  comparison: string;
  inputText: string;
  conditionValue: string;
}

export interface CondicionalState {
  logicNodes: number[];
  logicNodeData: LogicNodeData[][];
}
