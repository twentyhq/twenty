export type RemoteElementCommand<TRequest> = {
  sequence: number;
  acknowledgedNativeEditSequence?: number;
  request: TRequest;
};
