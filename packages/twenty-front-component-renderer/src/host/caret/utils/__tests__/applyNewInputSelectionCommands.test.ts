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
    });

    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);
    expect(appliedSelectionSequenceRef.current).toBe(2);
  });

  it('should skip a command that arrives after a newer one', () => {
    const input = createConnectedTextInput('hello world');
    const appliedSelectionSequenceRef = { current: 0 };

    applyNewInputSelectionCommands({
      element: input,
      selectionCommands: [
        {
          sequence: 3,
          request: {
            method: 'setSelectionRange',
            start: 1,
            end: 2,
            direction: 'none',
          },
        },
        {
          sequence: 2,
          request: {
            method: 'setSelectionRange',
            start: 5,
            end: 6,
            direction: 'none',
          },
        },
      ],
      appliedSelectionSequenceRef,
    });

    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(2);
    expect(appliedSelectionSequenceRef.current).toBe(3);
  });

  it('should acknowledge commands while no element is attached', () => {
    const appliedSelectionSequenceRef = { current: 0 };

    applyNewInputSelectionCommands({
      element: null,
      selectionCommands: [{ sequence: 5, request: { method: 'select' } }],
      appliedSelectionSequenceRef,
    });

    expect(appliedSelectionSequenceRef.current).toBe(5);
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
      });

      expect(input.selectionStart).toBe(11);
      expect(appliedSelectionSequenceRef.current).toBe(0);
    },
  );
});
