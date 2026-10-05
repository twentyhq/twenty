import { syncValuePreservingCaret } from '../syncValuePreservingCaret';

describe('syncValuePreservingCaret', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should update the value when it differs', () => {
    const input = document.createElement('input');
    input.value = 'old';

    syncValuePreservingCaret(input, 'new');

    expect(input.value).toBe('new');
  });

  it('should do nothing when the value is already equal', () => {
    const input = document.createElement('input');
    input.value = 'same';

    syncValuePreservingCaret(input, 'same');

    expect(input.value).toBe('same');
  });

  it('should preserve the caret selection when the element is focused', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.value = 'hello world';
    input.focus();
    input.setSelectionRange(2, 5);

    syncValuePreservingCaret(input, 'HELLO world');

    expect(input.value).toBe('HELLO world');
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(5);
  });
});
