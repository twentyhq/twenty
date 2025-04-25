export interface LogicNodeData {
  comparison: string;
  inputText: string;
  conditionValue: string;
}

export interface CondicionalState {
  logicNodes: number[];
  logicNodeData: LogicNodeData[][];
}

export type ExtendedLogicNodeData = LogicNodeData & {
  outgoingEdgeId?: string;
  outgoingNodeId?: string;
};

export interface LogicData {
  logicNodes: number[];
  logicNodeData: ExtendedLogicNodeData[][];
}
