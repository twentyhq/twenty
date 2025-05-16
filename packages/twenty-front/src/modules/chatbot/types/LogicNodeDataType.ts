export interface NewLogicNodeData {
  option: string;
  comparison: string;
  sectorId: string;
  conditionValue: '||';
  outgoingEdgeId?: string;
  outgoingNodeId?: string;
  incomingEdgeId?: string;
  incomingNodeId?: string;
}

export interface NewConditionalState {
  logicNodes: number[];
  logicNodeData: NewLogicNodeData[];
}
