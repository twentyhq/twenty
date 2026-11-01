export type FileInputHost = {
  openFilePicker: (remoteElementId: string) => void;
  dispose: () => void;
};
