import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

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

  it('collapses repeats of the same message into one toast', () => {
    expect(
      getToastOptionsFromError({ error: new Error('Connection lost') }),
    ).toMatchObject({
      children: 'Connection lost',
      dedupeKey: 'Connection lost',
    });
  });

  it('keeps conflicts on different records as separate toasts', () => {
    const buildConflictError = (conflictingRecordId: string) =>
      new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Record already exists',
            extensions: {
              userFriendlyMessage: 'Record already exists',
              conflictingRecordId,
              conflictingObjectNameSingular: 'person',
            },
          },
        ],
      });

    const firstOptions = getToastOptionsFromError({
      error: buildConflictError('record-1'),
    });
    const secondOptions = getToastOptionsFromError({
      error: buildConflictError('record-2'),
    });

    expect(firstOptions?.dedupeKey).toBe('Record already exists:record-1');
    expect(secondOptions?.dedupeKey).toBe('Record already exists:record-2');
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
