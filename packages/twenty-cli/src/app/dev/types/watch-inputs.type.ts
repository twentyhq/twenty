export type WatchInput = {
  path: string;
  kind: 'file' | 'directory';
  stamp: string | null;
};

export type WatchInputs = WatchInput[];
