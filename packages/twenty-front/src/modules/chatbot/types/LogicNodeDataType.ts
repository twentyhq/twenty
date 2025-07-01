export interface NewLogicNodeData {
  option: string;
  comparison: string;
  sectorId: string;
  conditionValue: '||';
  outgoingEdgeId?: string;
  outgoingNodeId?: string;
  incomingEdgeId?: string;
  incomingNodeId?: string;
  recordType?: RecordType;
  message?: string;
}

export interface NewConditionalState {
  logicNodes: number[];
  logicNodeData: NewLogicNodeData[];
}

export type RecordType = 'sectors' | 'text' | '';
