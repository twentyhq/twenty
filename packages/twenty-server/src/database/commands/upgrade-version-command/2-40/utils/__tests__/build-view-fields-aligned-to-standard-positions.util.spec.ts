import { buildViewFieldsAlignedToStandardPositions } from 'src/database/commands/upgrade-version-command/2-40/utils/build-view-fields-aligned-to-standard-positions.util';

const VIEW_UNIVERSAL_IDENTIFIER = 'view-1';

const buildViewField = (
  universalIdentifier: string,
  position: number,
  deletedAt: string | null = null,
) => ({
  universalIdentifier,
  position,
  deletedAt,
  viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
});

const buildMaps = (
  viewFields: ReturnType<typeof buildViewField>[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    viewFields.map((viewField) => [viewField.universalIdentifier, viewField]),
  ),
});

const buildView = (viewFieldUniversalIdentifiers: string[]) => ({
  universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldUniversalIdentifiers,
});

describe('buildViewFieldsAlignedToStandardPositions', () => {
  it('shifts the columns a newly inserted one displaced', () => {
    const updates = buildViewFieldsAlignedToStandardPositions({
      existingView: buildView(['status', 'sentAt']),
      flatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('sentAt', 1),
      ]),
      standardFlatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('scheduledAt', 1),
        buildViewField('sentAt', 2),
      ]),
    });

    expect(updates).toEqual([
      expect.objectContaining({ universalIdentifier: 'sentAt', position: 2 }),
    ]);
  });

  it('leaves a view already matching the standard layout untouched', () => {
    const updates = buildViewFieldsAlignedToStandardPositions({
      existingView: buildView(['status', 'sentAt']),
      flatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('sentAt', 1),
      ]),
      standardFlatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('sentAt', 1),
      ]),
    });

    expect(updates).toEqual([]);
  });

  it('keeps a column the user removed from taking up a position slot', () => {
    const updates = buildViewFieldsAlignedToStandardPositions({
      existingView: buildView(['status', 'removed', 'sentAt']),
      flatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('removed', 1, '2026-01-01T00:00:00.000Z'),
        buildViewField('sentAt', 2),
      ]),
      standardFlatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('sentAt', 1),
      ]),
    });

    expect(updates).toEqual([
      expect.objectContaining({ universalIdentifier: 'sentAt', position: 1 }),
    ]);
  });

  it('moves a column the standard application does not know about below the standard ones', () => {
    const updates = buildViewFieldsAlignedToStandardPositions({
      existingView: buildView(['status', 'custom']),
      flatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('custom', 1),
      ]),
      standardFlatViewFieldMaps: buildMaps([
        buildViewField('status', 0),
        buildViewField('scheduledAt', 1),
      ]),
    });

    expect(updates).toEqual([
      expect.objectContaining({ universalIdentifier: 'custom', position: 2 }),
    ]);
  });
});
