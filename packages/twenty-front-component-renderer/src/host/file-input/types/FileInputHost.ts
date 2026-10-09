export type FileInputHost = {
  reset: () => void;
  captureActivation: (
    event: Partial<Pick<Event, 'type' | 'isTrusted' | 'target'>>,
  ) => string | undefined;
  openFilePicker: (input: {
    remoteElementId: string;
    activationId: unknown;
  }) => void;
};
