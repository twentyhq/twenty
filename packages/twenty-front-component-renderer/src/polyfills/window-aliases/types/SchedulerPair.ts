export type SchedulerPair = {
  request: (...requestArguments: never[]) => unknown;
  cancel: (...cancelArguments: never[]) => void;
};
