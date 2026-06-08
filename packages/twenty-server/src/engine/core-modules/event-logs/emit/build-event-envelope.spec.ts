import {
  buildPageviewEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/event-logs/emit/build-event-envelope';

describe('build-event-envelope', () => {
  describe('computeEventContextFields', () => {
    it('keeps defined ids and drops null/undefined', () => {
      expect(
        computeEventContextFields({ workspaceId: 'w', userId: 'u' }),
      ).toEqual({ workspaceId: 'w', userId: 'u' });
      expect(
        computeEventContextFields({ workspaceId: 'w', userId: null }),
      ).toEqual({ workspaceId: 'w' });
      expect(computeEventContextFields()).toEqual({});
    });
  });

  describe('buildPageviewEnvelope', () => {
    it('tags the envelope with the pageview table and merges context', () => {
      const envelope = buildPageviewEnvelope(
        { workspaceId: 'w', userId: 'u' },
        'home',
        {},
      );

      expect(envelope.table).toBe('pageview');
      expect(envelope.row).toMatchObject({
        workspaceId: 'w',
        userId: 'u',
        type: 'page',
        name: 'home',
      });
    });
  });
});
