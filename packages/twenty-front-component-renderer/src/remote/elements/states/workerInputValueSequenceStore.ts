const inputValueSequences = new WeakMap<object, number>();

export const workerInputValueSequenceStore = {
  read: (element: object): number => inputValueSequences.get(element) ?? 0,
  record: ({
    element,
    sequence,
  }: {
    element: object;
    sequence: number;
  }): void => {
    inputValueSequences.set(element, sequence);
  },
};
