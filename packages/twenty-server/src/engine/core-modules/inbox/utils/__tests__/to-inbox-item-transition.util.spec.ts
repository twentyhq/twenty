import { InboxException } from 'src/engine/core-modules/inbox/inbox.exception';
import { toInboxItemTransition } from 'src/engine/core-modules/inbox/utils/to-inbox-item-transition.util';

describe('toInboxItemTransition', () => {
  it('should narrow a bare clear', () => {
    // Act & Assert
    expect(toInboxItemTransition({ kind: 'CLEAR' })).toEqual({ kind: 'CLEAR' });
  });

  it('should carry the outcome and its result through', () => {
    // Act
    const transition = toInboxItemTransition({
      kind: 'CLEAR',
      outcome: 'APPROVED',
      result: { note: 'Looks right' },
    });

    // Assert
    expect(transition).toEqual({
      kind: 'CLEAR',
      outcome: 'APPROVED',
      result: { note: 'Looks right' },
    });
  });

  it('should treat a resurfacing time as a clear that expires', () => {
    // Act & Assert
    expect(
      toInboxItemTransition({ kind: 'CLEAR', resurfaceInMinutes: 60 }),
    ).toEqual({ kind: 'CLEAR', resurfaceInMinutes: 60 });
  });

  it('should carry an absolute time to come back', () => {
    const resurfaceAt = new Date('2026-09-04T09:00:00.000Z');

    expect(toInboxItemTransition({ kind: 'CLEAR', resurfaceAt })).toEqual({
      kind: 'CLEAR',
      resurfaceAt,
    });
  });

  it('should refuse a delay and a time together', () => {
    expect(() =>
      toInboxItemTransition({
        kind: 'CLEAR',
        resurfaceInMinutes: 60,
        resurfaceAt: new Date('2026-09-04T09:00:00.000Z'),
      }),
    ).toThrow(InboxException);
  });

  // An outcome records how the item ended, so asking for it back contradicts it
  it('should refuse a clear that both ends the item and brings it back', () => {
    // Act & Assert
    expect(() =>
      toInboxItemTransition({
        kind: 'CLEAR',
        outcome: 'APPROVED',
        resurfaceInMinutes: 60,
      }),
    ).toThrow(InboxException);
  });

  it('should refuse a kind it does not know', () => {
    // Act & Assert
    expect(() => toInboxItemTransition({ kind: 'RESOLVE' })).toThrow(
      InboxException,
    );
  });
});
