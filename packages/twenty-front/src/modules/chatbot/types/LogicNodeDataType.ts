export interface LogicNodeData {
  option: string;
  comparison: string;
  inputText: string;
  conditionValue: string;
}

export interface NewLogicNodeData {
  option: string;
  comparison: string;
  sectorId: string;
  conditionValue: '||';
  outgoingEdgeId?: string;
  outgoingNodeId?: string;
}

export interface NewConditionalState {
  logicNodes: number[];
  logicNodeData: NewLogicNodeData[];
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
