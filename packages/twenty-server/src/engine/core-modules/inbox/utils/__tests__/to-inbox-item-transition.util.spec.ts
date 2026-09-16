import { InboxException } from 'src/engine/core-modules/inbox/inbox.exception';
import { SELF_ASSIGNMENT } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { toInboxItemTransition } from 'src/engine/core-modules/inbox/utils/to-inbox-item-transition.util';

describe('toInboxItemTransition', () => {
  it('should narrow a bare clear', () => {
    expect(toInboxItemTransition({ kind: 'CLEAR' })).toEqual({ kind: 'CLEAR' });
  });

  it('should carry a time to come back as a clear that expires', () => {
    const resurfaceAt = new Date('2026-09-04T09:00:00.000Z');

    expect(toInboxItemTransition({ kind: 'CLEAR', resurfaceAt })).toEqual({
      kind: 'CLEAR',
      resurfaceAt,
    });
  });

  it('should refuse a kind it does not know', () => {
    expect(() => toInboxItemTransition({ kind: 'RESOLVE' })).toThrow(
      InboxException,
    );
  });

  describe('assigning', () => {
    it('should read a missing target as the actor taking the work', () => {
      expect(toInboxItemTransition({ kind: 'ASSIGN' })).toEqual({
        kind: 'ASSIGN',
        toUserWorkspaceId: SELF_ASSIGNMENT,
      });
    });

    // A transport that spells an absent field as an explicit undefined still
    // means the field was not sent, which is not the same as giving work back.
    it('should read a target that is present but undefined the same way', () => {
      expect(
        toInboxItemTransition({ kind: 'ASSIGN', toUserWorkspaceId: undefined }),
      ).toEqual({ kind: 'ASSIGN', toUserWorkspaceId: SELF_ASSIGNMENT });
    });

    it('should read a null target as giving the work back', () => {
      expect(
        toInboxItemTransition({ kind: 'ASSIGN', toUserWorkspaceId: null }),
      ).toEqual({ kind: 'ASSIGN', toUserWorkspaceId: null });
    });
  });

  describe('moving', () => {
    it('should refuse a move that names no destination', () => {
      expect(() => toInboxItemTransition({ kind: 'MOVE' })).toThrow(
        InboxException,
      );

      expect(() =>
        toInboxItemTransition({ kind: 'MOVE', toQueueId: undefined }),
      ).toThrow(InboxException);
    });

    it('should read a null destination as leaving every shared inbox', () => {
      expect(toInboxItemTransition({ kind: 'MOVE', toQueueId: null })).toEqual({
        kind: 'MOVE',
        toQueueId: null,
      });
    });
  });
});
