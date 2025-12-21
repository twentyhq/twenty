export type RecordReference = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

export type ToolOutput<T = object> = {
  success: boolean;
  message: string;
  error?: string;
  result?: T;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  // Record references for linking to created/found records
  recordReferences?: RecordReference[];
};
