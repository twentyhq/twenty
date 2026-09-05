import { InboxItemOutcome } from 'src/engine/core-modules/inbox/enums/inbox-item-outcome.enum';
import { InboxException } from 'src/engine/core-modules/inbox/inbox.exception';
import { toInboxItemTransition } from 'src/engine/core-modules/inbox/utils/to-inbox-item-transition.util';

describe('toInboxItemTransition', () => {
  it('should narrow a bare clear', () => {
    expect(toInboxItemTransition({ kind: 'CLEAR' })).toEqual({ kind: 'CLEAR' });
  });

  it('should carry the outcome through', () => {
    expect(
      toInboxItemTransition({
        kind: 'CLEAR',
        outcome: InboxItemOutcome.DISMISSED,
      }),
    ).toEqual({ kind: 'CLEAR', outcome: InboxItemOutcome.DISMISSED });
  });

  it('should carry a time to come back as a clear that expires', () => {
    const resurfaceAt = new Date('2026-09-04T09:00:00.000Z');

    expect(toInboxItemTransition({ kind: 'CLEAR', resurfaceAt })).toEqual({
      kind: 'CLEAR',
      resurfaceAt,
    });
  });

  // An outcome records how the item ended, so asking for it back contradicts it
  it('should refuse a clear that both ends the item and brings it back', () => {
    expect(() =>
      toInboxItemTransition({
        kind: 'CLEAR',
        outcome: InboxItemOutcome.DONE,
        resurfaceAt: new Date('2026-09-04T09:00:00.000Z'),
      }),
    ).toThrow(InboxException);
  });

  it('should refuse a kind it does not know', () => {
    expect(() => toInboxItemTransition({ kind: 'RESOLVE' })).toThrow(
      InboxException,
    );
  });
});
