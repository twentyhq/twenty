export interface QueryResultGuetterHandlerInterface {
  process(result: any, workspaceId: string): Promise<any>;
}
