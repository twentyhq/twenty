import { resolveCommandMenuItemSection } from '@/command-menu-item/utils/resolveCommandMenuItemSection';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

describe('resolveCommandMenuItemSection', () => {
  it('places a command from its engine key', () => {
    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.MERGE_MULTIPLE_RECORDS,
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      }),
    ).toBe('SELECTION');
  });

  it('places commands that act on the records in view in the current view section', () => {
    for (const engineComponentKey of [
      EngineComponentKey.EXPORT_VIEW,
      EngineComponentKey.SEE_DELETED_RECORDS,
      EngineComponentKey.HIDE_DELETED_RECORDS,
    ]) {
      expect(
        resolveCommandMenuItemSection({
          engineComponentKey,
          availabilityType:
            CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
        }),
      ).toBe('CURRENT_VIEW');
    }
  });

  it('sends every navigation command to Go to, whatever it targets', () => {
    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.NAVIGATION,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
    ).toBe('GO_TO');
  });

  it('separates the two Compose Email commands by availability', () => {
    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.COMPOSE_EMAIL,
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      }),
    ).toBe('SELECTION');

    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.COMPOSE_EMAIL,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
    ).toBe('WORKSPACE');
  });

  it('separates the two Compose Campaign commands by availability', () => {
    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.COMPOSE_CAMPAIGN,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
      }),
    ).toBe('THIS_OBJECT');

    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.COMPOSE_CAMPAIGN,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
    ).toBe('WORKSPACE');
  });

  it('lands an app command where its availability says', () => {
    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
    ).toBe('WORKSPACE');

    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      }),
    ).toBe('SELECTION');
  });

  it('tells a per-object creation command from the view own create', () => {
    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
      }),
    ).toBe('THIS_OBJECT');

    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        creationTargetObjectMetadataId: 'object-metadata-id',
      }),
    ).toBe('CREATE_RECORD');
  });

  it('still places a deprecated key from a workspace that has not migrated', () => {
    expect(
      resolveCommandMenuItemSection({
        engineComponentKey: EngineComponentKey.GO_TO_SETTINGS,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
    ).toBe('GO_TO');
  });
});
