import { applyNewInputSelectionCommands } from '../applyNewInputSelectionCommands';

const createConnectedTextInput = (value: string): HTMLInputElement => {
  const input = document.createElement('input');
  input.value = value;
  document.body.appendChild(input);

  return input;
};

describe('applyNewInputSelectionCommands', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should apply only the commands newer than the applied sequence', () => {
    const input = createConnectedTextInput('hello world');
    const appliedSelectionSequenceRef = { current: 1 };

    applyNewInputSelectionCommands({
      element: input,
      selectionCommands: [
        { sequence: 1, request: { method: 'select' } },
        { sequence: 2, request: { property: 'selectionEnd', value: 4 } },
      ],
      appliedSelectionSequenceRef,
      latestInputValueSequence: 0,
    });

    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);
    expect(appliedSelectionSequenceRef.current).toBe(2);
  });

  it.each([
    {
      selectionCommands: [
        null,
        'select',
        { sequence: '7', request: { method: 'select' } },
      ],
    },
    { selectionCommands: { sequence: 1, request: { method: 'select' } } },
  ])(
    'should ignore the malformed selection commands $selectionCommands',
    ({ selectionCommands }) => {
      const input = createConnectedTextInput('hello world');
      const appliedSelectionSequenceRef = { current: 0 };

      applyNewInputSelectionCommands({
        element: input,
        selectionCommands,
        appliedSelectionSequenceRef,
        latestInputValueSequence: 0,
      });

      expect(input.selectionStart).toBe(11);
      expect(appliedSelectionSequenceRef.current).toBe(0);
    },
  );
});
