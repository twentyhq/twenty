export type HostScrollController = {
  enqueueScrollCommands: (input: {
    remoteElementId: string;
    scrollCommands: unknown[];
    onScrollUpdate: unknown;
  }) => void;
  reset: () => void;
};
