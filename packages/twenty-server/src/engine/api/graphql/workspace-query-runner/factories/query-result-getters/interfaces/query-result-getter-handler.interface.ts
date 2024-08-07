export interface QueryResultGetterHandlerInterface {
  handle(result: any, workspaceId: string): Promise<any>;
}
