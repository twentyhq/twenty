import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { buildGoToWorkflowsCommandMenuItemToCreate } from 'src/database/commands/upgrade-version-command/2-46/utils/build-go-to-workflows-command-menu-item-to-create.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-10-06T10:00:00.000Z';

const STANDARD_COMMAND_MENU_ITEM = {
  applicationId: 'standard-application-id',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} as FlatCommandMenuItem;

const build = (
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >,
) =>
  buildGoToWorkflowsCommandMenuItemToCreate({
    flatCommandMenuItemsByUniversalIdentifier,
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    workspaceId: 'workspace-id',
    now: NOW,
  });

describe('buildGoToWorkflowsCommandMenuItemToCreate', () => {
  it('builds the standard Go to Workflows navigation command', () => {
    expect(
      build({ 'standard-command-uid': STANDARD_COMMAND_MENU_ITEM }),
    ).toMatchObject({
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.goToWorkflows.universalIdentifier,
      applicationId: 'standard-application-id',
      workspaceId: 'workspace-id',
      engineComponentKey: EngineComponentKey.NAVIGATION,
      payload: { path: '/workflows' },
      conditionalAvailabilityExpression: 'permissionFlags.WORKFLOWS',
      availabilityObjectMetadataId: null,
    });
  });

  it('skips a workspace that already has the command', () => {
    expect(
      build({
        'standard-command-uid': STANDARD_COMMAND_MENU_ITEM,
        [STANDARD_COMMAND_MENU_ITEMS.goToWorkflows.universalIdentifier]:
          STANDARD_COMMAND_MENU_ITEM,
      }),
    ).toBeUndefined();
  });

  it('skips a workspace without standard commands', () => {
    expect(build({})).toBeUndefined();
  });
});
