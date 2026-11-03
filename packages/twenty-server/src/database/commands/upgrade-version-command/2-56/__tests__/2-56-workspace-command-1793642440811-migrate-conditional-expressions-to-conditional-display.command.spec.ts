import { FieldMetadataType } from 'twenty-shared/types';
import { buildDeviceConditionalDisplay } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { MigrateConditionalExpressionsToConditionalDisplayCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793642440811-migrate-conditional-expressions-to-conditional-display.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STANDARD_WIDGET_ID = '20202020-0000-4000-8000-0000000000b1';
const DROPDOWN_WIDGET_ID = '20202020-0000-4000-8000-0000000000b2';
const NON_DEVICE_WIDGET_ID = '20202020-0000-4000-8000-0000000000b3';
const APPLICATION_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';

const NON_DEVICE_CONDITIONAL_DISPLAY = compileLegacyWidgetJsonLogic({
  jsonLogic: { '==': [{ var: 'selectedRecords.0.stage' }, 'WON'] },
  resolveField: () => ({
    fieldMetadataId: '20202020-1111-4111-8111-000000000002',
    type: FieldMetadataType.SELECT,
  }),
});

const PAGE_LAYOUT_WIDGETS = [
  {
    id: STANDARD_WIDGET_ID,
    universalIdentifier: 'standard-widget',
    conditionalAvailabilityExpression: 'device == "MOBILE"',
    conditionalAvailability: null,
    conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
    overrides: null,
  },
  {
    id: DROPDOWN_WIDGET_ID,
    universalIdentifier: 'dropdown-widget',
    conditionalAvailabilityExpression: null,
    conditionalAvailability: null,
    conditionalDisplay: buildDeviceConditionalDisplay('DESKTOP'),
    overrides: null,
  },
  {
    id: NON_DEVICE_WIDGET_ID,
    universalIdentifier: 'non-device-widget',
    conditionalAvailabilityExpression: null,
    conditionalAvailability: null,
    conditionalDisplay: NON_DEVICE_CONDITIONAL_DISPLAY,
    overrides: {
      [APPLICATION_UNIVERSAL_IDENTIFIER]: {
        conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
      },
    },
  },
];

describe('MigrateConditionalExpressionsToConditionalDisplayCommand', () => {
  let queries: { sql: string; parameters: unknown[] }[];
  let command: MigrateConditionalExpressionsToConditionalDisplayCommand;

  beforeEach(() => {
    queries = [];

    const workspaceCacheService = {
      getOrRecompute: jest.fn(async () => ({
        flatCommandMenuItemMaps: { byUniversalIdentifier: {} },
        flatPageLayoutWidgetMaps: {
          byUniversalIdentifier: Object.fromEntries(
            PAGE_LAYOUT_WIDGETS.map((widget) => [
              widget.universalIdentifier,
              widget,
            ]),
          ),
        },
      })),
      invalidateAndRecompute: jest.fn(async () => undefined),
    } as unknown as WorkspaceCacheService;

    const coreDataSource = {
      transaction: jest.fn(
        async (
          run: (entityManager: {
            query: (sql: string, parameters: unknown[]) => Promise<void>;
          }) => Promise<void>,
        ) =>
          run({
            query: async (sql, parameters) => {
              queries.push({ sql, parameters });
            },
          }),
      ),
    } as unknown as DataSource;

    command = new MigrateConditionalExpressionsToConditionalDisplayCommand(
      {} as WorkspaceIteratorService,
      {} as ApplicationService,
      workspaceCacheService,
      {} as WorkspaceMigrationValidateBuildAndRunService,
      coreDataSource,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  const restorePageLayoutWidgets = async () => {
    await command.down({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    const pageLayoutWidgetQuery = queries.find(({ sql }) =>
      sql.includes('core."pageLayoutWidget"'),
    );

    return JSON.parse(pageLayoutWidgetQuery?.parameters[0] as string) as {
      id: string;
      conditionalDisplay: unknown;
      overrides: unknown;
    }[];
  };

  it('should clear the display of a widget gated by its device expression', async () => {
    const restoredWidgets = await restorePageLayoutWidgets();

    expect(
      restoredWidgets.find(({ id }) => id === STANDARD_WIDGET_ID),
    ).toMatchObject({ conditionalDisplay: null, overrides: null });
  });

  it('should restore the device json-logic of a widget set from the dropdown', async () => {
    const restoredWidgets = await restorePageLayoutWidgets();

    expect(
      restoredWidgets.find(({ id }) => id === DROPDOWN_WIDGET_ID),
    ).toMatchObject({
      conditionalDisplay: { and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }] },
    });
  });

  it('should keep a non-device display and restore its device override entry', async () => {
    const restoredWidgets = await restorePageLayoutWidgets();

    expect(
      restoredWidgets.find(({ id }) => id === NON_DEVICE_WIDGET_ID),
    ).toEqual({
      id: NON_DEVICE_WIDGET_ID,
      conditionalAvailability: null,
      conditionalDisplay: NON_DEVICE_CONDITIONAL_DISPLAY,
      overrides: {
        [APPLICATION_UNIVERSAL_IDENTIFIER]: {
          conditionalDisplay: {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          },
        },
      },
    });
  });
});
