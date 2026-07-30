import { describe, expect, it } from 'vitest';

import {
  foldEmail,
  foldMeeting,
} from 'src/utils/last-contact/fold-interactions';
import { type PersonAgg } from 'src/utils/last-contact/types';

const OLDER = '2026-01-01T10:00:00.000Z';
const NEWER = '2026-02-01T10:00:00.000Z';

describe('foldEmail', () => {
  it('should record an outbound email when the sender is a workspace member', () => {
    const agg: PersonAgg = {};

    foldEmail(agg, NEWER, 'message-1', {
      ownerId: 'member-1',
      fromIsMember: true,
    });

    expect(agg).toEqual({
      lastEmail: { at: NEWER, id: 'message-1' },
      lastOutboundAt: NEWER,
      lastContactAt: NEWER,
      lastContactById: 'member-1',
      item: { kind: 'email', id: 'message-1' },
    });
  });

  it('should record an inbound email when the sender is not a workspace member', () => {
    const agg: PersonAgg = {};

    foldEmail(agg, NEWER, 'message-1', {
      ownerId: 'member-1',
      fromIsMember: false,
    });

    expect(agg.lastInboundAt).toBe(NEWER);
    expect(agg.lastOutboundAt).toBeUndefined();
  });

  it('should keep the newest email when an older one is folded in afterwards', () => {
    const agg: PersonAgg = {};

    foldEmail(agg, NEWER, 'newer-message', {
      ownerId: 'member-1',
      fromIsMember: true,
    });
    foldEmail(agg, OLDER, 'older-message', {
      ownerId: 'member-2',
      fromIsMember: true,
    });

    expect(agg.lastContactAt).toBe(NEWER);
    expect(agg.lastContactById).toBe('member-1');
    expect(agg.lastEmail).toEqual({ at: NEWER, id: 'newer-message' });
  });

  it('should leave lastContactById null when the message has no workspace member', () => {
    const agg: PersonAgg = {};

    foldEmail(agg, NEWER, 'message-1', undefined);

    expect(agg.lastContactById).toBeNull();
    expect(agg.lastInboundAt).toBe(NEWER);
  });
});

describe('foldMeeting', () => {
  it('should count a meeting as both inbound and outbound contact', () => {
    const agg: PersonAgg = {};

    foldMeeting(agg, NEWER, 'event-1', 'member-1');

    expect(agg).toEqual({
      lastMeeting: { at: NEWER, id: 'event-1' },
      lastOutboundAt: NEWER,
      lastInboundAt: NEWER,
      lastContactAt: NEWER,
      lastContactById: 'member-1',
      item: { kind: 'meeting', id: 'event-1' },
    });
  });

  it('should let a newer meeting win over an older email', () => {
    const agg: PersonAgg = {};

    foldEmail(agg, OLDER, 'message-1', {
      ownerId: 'member-1',
      fromIsMember: true,
    });
    foldMeeting(agg, NEWER, 'event-1', 'member-2');

    expect(agg.lastContactAt).toBe(NEWER);
    expect(agg.lastContactById).toBe('member-2');
    expect(agg.item).toEqual({ kind: 'meeting', id: 'event-1' });
    expect(agg.lastEmail).toEqual({ at: OLDER, id: 'message-1' });
  });

  it('should keep an older meeting as lastMeeting when a newer email arrives', () => {
    const agg: PersonAgg = {};

    foldMeeting(agg, OLDER, 'event-1', 'member-1');
    foldEmail(agg, NEWER, 'message-1', {
      ownerId: 'member-2',
      fromIsMember: false,
    });

    expect(agg.item).toEqual({ kind: 'email', id: 'message-1' });
    expect(agg.lastMeeting).toEqual({ at: OLDER, id: 'event-1' });
    expect(agg.lastOutboundAt).toBe(OLDER);
    expect(agg.lastInboundAt).toBe(NEWER);
  });
});
