export type UninstallPayload = {
  version?: string;
};

export type UninstallHandler = (
  payload: UninstallPayload,
) => any | Promise<any>;
