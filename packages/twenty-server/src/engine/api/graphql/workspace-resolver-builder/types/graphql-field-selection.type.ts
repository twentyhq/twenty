export type GraphqlFieldSelection = {
  responseKey: string;
  fieldName: string;
  arguments: Record<string, unknown>;
  selections: GraphqlFieldSelection[];
};
