import { buildWorkflowFavoriteCoreIdBackfillUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-workflow-favorite-core-id-backfill-updates.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';

const WORKFLOW_OBJECT_METADATA_ID = 'workflow-object-metadata-id';
const NOW = '2026-09-21T00:00:00.000Z';

const buildFlatNavigationMenuItem = (
  overrides: Partial<FlatNavigationMenuItem>,
): FlatNavigationMenuItem =>
  ({
    id: 'navigation-menu-item-id',
    type: NavigationMenuItemType.RECORD,
    targetObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
    targetRecordId: 'workspace-workflow-id',
    userWorkspaceId: 'user-workspace-id',
    folderId: 'folder-id',
    position: 3,
    color: 'blue',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as unknown as FlatNavigationMenuItem;

describe('buildWorkflowFavoriteCoreIdBackfillUpdates', () => {
  it('rewrites a workspace workflow id to its core workflow id', () => {
    const updates = buildWorkflowFavoriteCoreIdBackfillUpdates({
      flatNavigationMenuItems: [buildFlatNavigationMenuItem({})],
      workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
      coreWorkflowIdByWorkspaceWorkflowId: new Map([
        ['workspace-workflow-id', 'core-workflow-id'],
      ]),
      now: NOW,
    });

    expect(updates).toHaveLength(1);
    expect(updates[0].targetRecordId).toBe('core-workflow-id');
    expect(updates[0].updatedAt).toBe(NOW);
  });

  it('preserves every unrelated navigation menu item field', () => {
    const [update] = buildWorkflowFavoriteCoreIdBackfillUpdates({
      flatNavigationMenuItems: [buildFlatNavigationMenuItem({})],
      workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
      coreWorkflowIdByWorkspaceWorkflowId: new Map([
        ['workspace-workflow-id', 'core-workflow-id'],
      ]),
      now: NOW,
    });

    expect(update).toMatchObject({
      id: 'navigation-menu-item-id',
      userWorkspaceId: 'user-workspace-id',
      folderId: 'folder-id',
      position: 3,
      color: 'blue',
      targetObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
    });
  });

  it('leaves favorites of other objects untouched', () => {
    expect(
      buildWorkflowFavoriteCoreIdBackfillUpdates({
        flatNavigationMenuItems: [
          buildFlatNavigationMenuItem({
            targetObjectMetadataId: 'company-object-metadata-id',
          }),
        ],
        workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        coreWorkflowIdByWorkspaceWorkflowId: new Map([
          ['workspace-workflow-id', 'core-workflow-id'],
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('leaves non-record navigation menu items untouched', () => {
    expect(
      buildWorkflowFavoriteCoreIdBackfillUpdates({
        flatNavigationMenuItems: [
          buildFlatNavigationMenuItem({
            type: NavigationMenuItemType.OBJECT,
            targetRecordId: null,
          }),
        ],
        workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        coreWorkflowIdByWorkspaceWorkflowId: new Map([
          ['workspace-workflow-id', 'core-workflow-id'],
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('leaves a favorite already holding a core workflow id untouched', () => {
    expect(
      buildWorkflowFavoriteCoreIdBackfillUpdates({
        flatNavigationMenuItems: [
          buildFlatNavigationMenuItem({ targetRecordId: 'core-workflow-id' }),
        ],
        workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        coreWorkflowIdByWorkspaceWorkflowId: new Map([
          ['workspace-workflow-id', 'core-workflow-id'],
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips a legacy favorite when the same owner already holds the core id', () => {
    expect(
      buildWorkflowFavoriteCoreIdBackfillUpdates({
        flatNavigationMenuItems: [
          buildFlatNavigationMenuItem({ id: 'legacy-item' }),
          buildFlatNavigationMenuItem({
            id: 'core-item',
            targetRecordId: 'core-workflow-id',
          }),
        ],
        workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        coreWorkflowIdByWorkspaceWorkflowId: new Map([
          ['workspace-workflow-id', 'core-workflow-id'],
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('still backfills when another member holds the core id', () => {
    const updates = buildWorkflowFavoriteCoreIdBackfillUpdates({
      flatNavigationMenuItems: [
        buildFlatNavigationMenuItem({ id: 'legacy-item' }),
        buildFlatNavigationMenuItem({
          id: 'core-item',
          targetRecordId: 'core-workflow-id',
          userWorkspaceId: 'another-user-workspace-id',
        }),
      ],
      workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
      coreWorkflowIdByWorkspaceWorkflowId: new Map([
        ['workspace-workflow-id', 'core-workflow-id'],
      ]),
      now: NOW,
    });

    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe('legacy-item');
  });

  it('leaves a favorite whose workflow has no core counterpart untouched', () => {
    expect(
      buildWorkflowFavoriteCoreIdBackfillUpdates({
        flatNavigationMenuItems: [buildFlatNavigationMenuItem({})],
        workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        coreWorkflowIdByWorkspaceWorkflowId: new Map(),
        now: NOW,
      }),
    ).toEqual([]);
  });
});
