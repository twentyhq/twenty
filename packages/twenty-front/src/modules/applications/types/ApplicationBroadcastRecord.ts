// Partial application row carried by SSE broadcast events: `after` payloads
// always contain the record id but not necessarily every column.
export type ApplicationBroadcastRecord = {
  id: string;
};
