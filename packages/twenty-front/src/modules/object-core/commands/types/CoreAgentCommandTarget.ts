export type CoreAgentCommandTarget =
  | { type: 'index'; tableId: string }
  | { type: 'record'; agentId: string };
