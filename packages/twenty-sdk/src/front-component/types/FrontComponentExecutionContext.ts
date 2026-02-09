// Serializable execution context that can be passed via postMessage (no functions)
export type FrontComponentExecutionContext = {
  userId: string | null;
};
