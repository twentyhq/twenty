const inputValueSequenceByElement = new WeakMap<object, number>();

let lastInputValueSequence = 0;

export const hostInputValueSequenceStore = {
  read: (element: object): number =>
    inputValueSequenceByElement.get(element) ?? 0,
  recordEdit: (element: object): void => {
    lastInputValueSequence += 1;
    inputValueSequenceByElement.set(element, lastInputValueSequence);
  },
};
