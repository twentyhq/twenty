export type InstallPayload = {
  previousVersion?: string;
  newVersion: string;
};

export type InstallHandler = (payload: InstallPayload) => any | Promise<any>;
