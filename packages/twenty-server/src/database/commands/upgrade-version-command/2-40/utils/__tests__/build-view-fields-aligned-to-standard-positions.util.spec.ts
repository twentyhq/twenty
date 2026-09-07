import { buildViewFieldsAlignedToStandardPositions } from 'src/database/commands/upgrade-version-command/2-40/utils/build-view-fields-aligned-to-standard-positions.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const VIEW_UNIVERSAL_IDENTIFIER = 'view-1';

const buildViewField = (
  universalIdentifier: string,
  position: number,
): FlatViewField =>
  ({
    universalIdentifier,
    position,
    viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
  }) as FlatViewField;

const buildMaps = (
  viewFields: FlatViewField[],
): FlatEntityMaps<FlatViewField> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      viewFields.map((viewField) => [viewField.universalIdentifier, viewField]),
    ),
  }) as FlatEntityMaps<FlatViewField>;

const buildView = (viewFieldUniversalIdentifiers: string[]): FlatView =>
  ({
    universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
    viewFieldUniversalIdentifiers,
  }) as FlatView;

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
