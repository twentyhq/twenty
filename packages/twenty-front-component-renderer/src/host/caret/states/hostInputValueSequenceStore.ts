const inputValueStates = new WeakMap<
  object,
  { sequence: number; value: string }
>();

let lastInputValueSequence = 0;

export const hostInputValueSequenceStore = {
  read: (element: object): number =>
    inputValueStates.get(element)?.sequence ?? 0,
  recordEdit: ({
    element,
    shouldSkipUnchangedValue,
  }: {
    element: HTMLInputElement | HTMLTextAreaElement;
    shouldSkipUnchangedValue: boolean;
  }): void => {
    const previousState = inputValueStates.get(element);

    if (shouldSkipUnchangedValue && previousState?.value === element.value) {
      return;
    }

    lastInputValueSequence += 1;
    inputValueStates.set(element, {
      sequence: lastInputValueSequence,
      value: element.value,
    });
  },
};
