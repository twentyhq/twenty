export type PostInstallPayload = {
  previousVersion?: string;
  newVersion: string;
};

export type PostInstallHandler = (
  payload: PostInstallPayload,
) => any | Promise<any>;
