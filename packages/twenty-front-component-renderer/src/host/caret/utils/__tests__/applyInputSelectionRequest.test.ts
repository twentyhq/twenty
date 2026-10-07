import { applyInputSelectionRequest } from '../applyInputSelectionRequest';

const createConnectedInput = ({
  type,
  value,
}: {
  type: string;
  value: string;
}): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  document.body.appendChild(input);

  return input;
};

describe('applyInputSelectionRequest', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should select the whole value', () => {
    const input = createConnectedInput({ type: 'text', value: 'hello' });

    applyInputSelectionRequest({
      element: input,
      request: { method: 'select' },
    });

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(5);
  });

  it('should set the requested selection range', () => {
    const input = createConnectedInput({ type: 'text', value: 'hello world' });

    applyInputSelectionRequest({
      element: input,
      request: {
        method: 'setSelectionRange',
        start: 2,
        end: 5,
        direction: 'backward',
      },
    });

    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(5);
    expect(input.selectionDirection).toBe('backward');
  });

  it('should move a single selection offset', () => {
    const input = createConnectedInput({ type: 'text', value: 'hello world' });

    applyInputSelectionRequest({
      element: input,
      request: { property: 'selectionStart', value: 3 },
    });

    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(11);
  });

  it('should set the selection direction', () => {
    const input = createConnectedInput({ type: 'text', value: 'hello world' });
    input.setSelectionRange(1, 4);

    applyInputSelectionRequest({
      element: input,
      request: { property: 'selectionDirection', value: 'backward' },
    });

    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(4);
    expect(input.selectionDirection).toBe('backward');
  });

  it('should ignore an element that is not connected', () => {
    const input = document.createElement('input');
    input.value = 'hello';

    applyInputSelectionRequest({
      element: input,
      request: { method: 'select' },
    });

    expect(input.selectionStart).toBe(5);
  });

  it.each([
    { method: 'setSelectionRange', start: 0, end: 1, direction: 'none' },
    { property: 'selectionStart', value: 0 },
    { property: 'selectionDirection', value: 'backward' },
  ])(
    'should ignore the range request %p on an input without a selection range',
    (request) => {
      const input = createConnectedInput({ type: 'number', value: '42' });

      expect(() =>
        applyInputSelectionRequest({ element: input, request }),
      ).not.toThrow();
    },
  );

  it.each([
    null,
    'select',
    { method: 'setSelectionRange', start: '1', end: 2 },
    { property: 'selectionEnd', value: '2' },
    { property: 'selectionDirection', value: 'sideways' },
  ])('should ignore the malformed request %p', (request) => {
    const input = createConnectedInput({ type: 'text', value: 'hello world' });
    input.setSelectionRange(2, 5, 'backward');

    applyInputSelectionRequest({ element: input, request });

    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(5);
    expect(input.selectionDirection).toBe('backward');
  });
});
