import { isCommandMenuItemNavigatingToJunctionObject } from '@/command-menu-item/utils/isCommandMenuItemNavigatingToJunctionObject';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const JUNCTION_OBJECT_METADATA_ID = '20202020-0000-4000-8000-00000000j001';
const NAVIGABLE_OBJECT_METADATA_ID = '20202020-0000-4000-8000-00000000n001';

// Which ids resolve as junctions is `getJunctionObjectMetadataIds`' concern and
// is covered by its own suite; this one only pins the command-side rule.
const junctionObjectMetadataIds = new Set([JUNCTION_OBJECT_METADATA_ID]);

const buildCommandMenuItem = ({
  engineComponentKey,
  navigationTargetObjectMetadataId,
}: {
  engineComponentKey: EngineComponentKey;
  navigationTargetObjectMetadataId?: string | null;
}) =>
  ({
    engineComponentKey,
    navigationTargetObjectMetadataId,
  }) as CommandMenuItemFieldsFragment;

describe('isCommandMenuItemNavigatingToJunctionObject', () => {
  it('matches a navigation command pointing at a junction object', () => {
    expect(
      isCommandMenuItemNavigatingToJunctionObject({
        commandMenuItem: buildCommandMenuItem({
          engineComponentKey: EngineComponentKey.NAVIGATION,
          navigationTargetObjectMetadataId: JUNCTION_OBJECT_METADATA_ID,
        }),
        junctionObjectMetadataIds,
      }),
    ).toBe(true);
  });

  it('leaves a navigation command pointing at a navigable object alone', () => {
    expect(
      isCommandMenuItemNavigatingToJunctionObject({
        commandMenuItem: buildCommandMenuItem({
          engineComponentKey: EngineComponentKey.NAVIGATION,
          navigationTargetObjectMetadataId: NAVIGABLE_OBJECT_METADATA_ID,
        }),
        junctionObjectMetadataIds,
      }),
    ).toBe(false);
  });

  it('only concerns navigation commands', () => {
    // Another engine command carrying the same target is not a dead link --
    // it acts on the object rather than navigating to its index page.
    expect(
      isCommandMenuItemNavigatingToJunctionObject({
        commandMenuItem: buildCommandMenuItem({
          engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
          navigationTargetObjectMetadataId: JUNCTION_OBJECT_METADATA_ID,
        }),
        junctionObjectMetadataIds,
      }),
    ).toBe(false);
  });

  it('leaves a navigation command without a target alone', () => {
    for (const navigationTargetObjectMetadataId of [null, undefined]) {
      expect(
        isCommandMenuItemNavigatingToJunctionObject({
          commandMenuItem: buildCommandMenuItem({
            engineComponentKey: EngineComponentKey.NAVIGATION,
            navigationTargetObjectMetadataId,
          }),
          junctionObjectMetadataIds,
        }),
      ).toBe(false);
    }
  });

  it('keeps every command when no object resolves as a junction', () => {
    expect(
      isCommandMenuItemNavigatingToJunctionObject({
        commandMenuItem: buildCommandMenuItem({
          engineComponentKey: EngineComponentKey.NAVIGATION,
          navigationTargetObjectMetadataId: JUNCTION_OBJECT_METADATA_ID,
        }),
        junctionObjectMetadataIds: new Set<string>(),
      }),
    ).toBe(false);
  });
});
