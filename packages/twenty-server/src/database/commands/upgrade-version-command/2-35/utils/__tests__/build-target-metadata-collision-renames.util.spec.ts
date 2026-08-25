import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  buildTargetFieldCollisionRenameUpdates,
  buildTargetObjectCollisionRenameUpdates,
} from 'src/database/commands/upgrade-version-command/2-35/utils/build-target-metadata-collision-renames.util';

const NOW = '2026-08-25T00:00:00.000Z';

describe('target metadata collision renames', () => {
  it('renames a custom object occupying a target object name', () => {
    const collidingObject = {
      universalIdentifier: 'custom-object',
      nameSingular: 'calendarEventTarget',
      namePlural: 'calendarEventTargets',
      labelSingular: 'Calendar Event Target',
      labelPlural: 'Calendar Event Targets',
    } as FlatObjectMetadata;
    const flatObjectMetadataMaps = {
      byUniversalIdentifier: { 'custom-object': collidingObject },
    } as unknown as FlatEntityMaps<FlatObjectMetadata>;

    expect(
      buildTargetObjectCollisionRenameUpdates({
        flatObjectMetadataMaps,
        now: NOW,
      }),
    ).toEqual([
      expect.objectContaining({
        nameSingular: 'calendarEventTargetOld',
        namePlural: 'calendarEventTargetsOld',
        labelSingular: 'Calendar Event Target (Old)',
        updatedAt: NOW,
      }),
    ]);
  });

  it('renames only a conflicting field on the same parent object', () => {
    const collidingField = {
      universalIdentifier: 'custom-field',
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.company.universalIdentifier,
      name: 'messageThreadTargets',
      label: 'Email history',
    } as FlatFieldMetadata;
    const unrelatedField = {
      universalIdentifier: 'unrelated-field',
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.person.universalIdentifier,
      name: 'messageThreadTargetsOld',
      label: 'Unrelated',
    } as FlatFieldMetadata;
    const flatFieldMetadataMaps = {
      byUniversalIdentifier: {
        'custom-field': collidingField,
        'unrelated-field': unrelatedField,
      },
    } as unknown as FlatEntityMaps<FlatFieldMetadata>;

    expect(
      buildTargetFieldCollisionRenameUpdates({
        flatFieldMetadataMaps,
        now: NOW,
      }),
    ).toEqual([
      expect.objectContaining({
        universalIdentifier: 'custom-field',
        name: 'messageThreadTargetsOld',
        label: 'Email history (Old)',
        updatedAt: NOW,
      }),
    ]);
  });

  it('does not rename the standard target fields themselves', () => {
    const standardField = {
      universalIdentifier:
        STANDARD_OBJECTS.calendarEvent.fields.calendarEventTargets
          .universalIdentifier,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      name: 'calendarEventTargets',
    } as FlatFieldMetadata;
    const flatFieldMetadataMaps = {
      byUniversalIdentifier: { standard: standardField },
    } as unknown as FlatEntityMaps<FlatFieldMetadata>;

    expect(
      buildTargetFieldCollisionRenameUpdates({
        flatFieldMetadataMaps,
        now: NOW,
      }),
    ).toEqual([]);
  });
});
