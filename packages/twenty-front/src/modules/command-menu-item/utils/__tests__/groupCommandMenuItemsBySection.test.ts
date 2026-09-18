import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { groupCommandMenuItemsBySection } from '@/command-menu-item/utils/groupCommandMenuItemsBySection';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const buildCommandMenuItem = (
  id: string,
  engineComponentKey: EngineComponentKey,
  availabilityType: CommandMenuItemAvailabilityType,
) =>
  ({
    id,
    engineComponentKey,
    availabilityType,
  }) as unknown as CommandMenuItemDefinition;

describe('groupCommandMenuItemsBySection', () => {
  it('groups every section, empty ones included', () => {
    expect(Object.keys(groupCommandMenuItemsBySection([]))).toEqual([
      'SELECTION',
      'THIS_VIEW',
      'ASK_AND_FIND',
      'CREATE_RECORD',
      'WORKSPACE',
      'GO_TO',
      'FALLBACK',
    ]);
  });

  it('keeps the incoming order within a section', () => {
    const commandMenuItemsBySection = groupCommandMenuItemsBySection([
      buildCommandMenuItem(
        'import',
        EngineComponentKey.IMPORT_RECORDS,
        CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
      ),
      buildCommandMenuItem(
        'search',
        EngineComponentKey.SEARCH_RECORDS,
        CommandMenuItemAvailabilityType.GLOBAL,
      ),
      buildCommandMenuItem(
        'create-view',
        EngineComponentKey.CREATE_NEW_VIEW,
        CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
      ),
    ]);

    expect(commandMenuItemsBySection.THIS_VIEW.map((item) => item.id)).toEqual([
      'import',
      'create-view',
    ]);
    expect(
      commandMenuItemsBySection.ASK_AND_FIND.map((item) => item.id),
    ).toEqual(['search']);
  });
});
