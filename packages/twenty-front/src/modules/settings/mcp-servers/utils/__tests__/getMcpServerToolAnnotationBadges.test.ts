import { getMcpServerToolAnnotationBadges } from '@/settings/mcp-servers/utils/getMcpServerToolAnnotationBadges';

describe('getMcpServerToolAnnotationBadges', () => {
  it('returns no badge without annotations', () => {
    expect(getMcpServerToolAnnotationBadges(null)).toEqual([]);
    expect(getMcpServerToolAnnotationBadges('not an object')).toEqual([]);
    expect(getMcpServerToolAnnotationBadges({ title: 'Search' })).toEqual([]);
  });

  it('returns no badge when a hint is not a boolean', () => {
    expect(getMcpServerToolAnnotationBadges({ readOnlyHint: 'yes' })).toEqual(
      [],
    );
  });

  it('maps each true hint to a badge', () => {
    expect(
      getMcpServerToolAnnotationBadges({
        readOnlyHint: true,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      }).map((badge) => badge.label),
    ).toEqual(['Read-only', 'Destructive', 'Idempotent', 'Open world']);
  });

  it('ignores hints that are false', () => {
    expect(
      getMcpServerToolAnnotationBadges({
        readOnlyHint: false,
        destructiveHint: true,
      }).map((badge) => badge.label),
    ).toEqual(['Destructive']);
  });
});
