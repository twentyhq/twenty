export type WorkflowManifestReferences = {
  logicFunctionIdByUniversalIdentifier: ReadonlyMap<string, string>;
  codeFunctionIdByUniversalIdentifier?: ReadonlyMap<string, string>;
  agentIdByUniversalIdentifier?: ReadonlyMap<string, string>;
  objectByUniversalIdentifier?: ReadonlyMap<string, { nameSingular: string }>;
  fieldByUniversalIdentifier?: ReadonlyMap<
    string,
    {
      id: string;
      name: string;
      objectUniversalIdentifier: string;
    }
  >;
};
