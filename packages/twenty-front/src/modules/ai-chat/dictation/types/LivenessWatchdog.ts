export type LivenessWatchdog = {
  arm: () => void;
  noteActivity: () => void;
  disarm: () => void;
};
