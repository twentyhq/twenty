export type InstallLogicFunctionPayload = {
  previousVersion: string;
};

export type InstallLogicFunctionHandler = (
  payload: InstallLogicFunctionPayload,
) => any | Promise<any>;
