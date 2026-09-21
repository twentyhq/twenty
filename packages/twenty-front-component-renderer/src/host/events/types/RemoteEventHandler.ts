export type RemoteEventHandler = (event: {
  preventDefault: () => void;
}) => void;
