import { syncRemoteValuePreservingCaret } from '../syncRemoteValuePreservingCaret';

describe('syncRemoteValuePreservingCaret', () => {
  it('should write a numeric remote value as text', () => {
    const input = document.createElement('input');
    input.value = '1';

    const didWriteValue = syncRemoteValuePreservingCaret({
      element: input,
      remoteValue: 42,
    });

    expect(didWriteValue).toBe(true);
    expect(input.value).toBe('42');
  });

  it.each([undefined, null, true, { text: 'hello' }])(
    'should ignore the non text remote value %p',
    (remoteValue) => {
      const input = document.createElement('input');
      input.value = 'kept';

      const didWriteValue = syncRemoteValuePreservingCaret({
        element: input,
        remoteValue,
      });

      expect(didWriteValue).toBe(false);
      expect(input.value).toBe('kept');
    },
  );

  it('should not write when no element is attached', () => {
    expect(
      syncRemoteValuePreservingCaret({ element: null, remoteValue: 'hello' }),
    ).toBe(false);
  });
});
