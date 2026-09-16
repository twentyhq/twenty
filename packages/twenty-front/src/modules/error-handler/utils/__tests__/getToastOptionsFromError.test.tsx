import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

describe('getToastOptionsFromError', () => {
  it('preserves custom content, actions, and delivery options', () => {
    const action = <a href="/help">Get help</a>;
    const onClose = jest.fn();

    expect(
      getToastOptionsFromError({
        error: new Error('Connection lost'),
        children: 'Try again later',
        description: 'Your changes are still here',
        action,
        duration: 10000,
        dedupeKey: 'connection',
        onClose,
      }),
    ).toEqual({
      variant: 'error',
      children: 'Try again later',
      description: 'Your changes are still here',
      action,
      duration: 10000,
      dedupeKey: 'connection',
      onClose,
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('suppresses aborted requests even when custom content is provided', () => {
    expect(
      getToastOptionsFromError({
        error: new DOMException('Request aborted', 'AbortError'),
        children: 'Try again later',
      }),
    ).toBeUndefined();
  });
});
