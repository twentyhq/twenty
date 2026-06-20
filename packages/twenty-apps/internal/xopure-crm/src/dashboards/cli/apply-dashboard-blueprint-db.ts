import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Pool, type PoolClient } from 'pg';

import { ambassadorCommandCenterBlueprint } from '../blueprints/ambassador-command-center.blueprint';
import { compIntegrityDashboardBlueprint } from '../blueprints/comp-integrity-dashboard.blueprint';
import { supportDashboardBlueprint } from '../blueprints/support-dashboard.blueprint';
import type {
  DashboardBlueprint,
  DashboardGraphWidgetBlueprint,
  DashboardRecordTableWidgetBlueprint,
  DashboardTabBlueprint,
  DashboardWidgetBlueprint,
} from '../blueprints/dashboard-blueprint.type';
import { fulfillmentDashboardBlueprint } from '../blueprints/fulfillment-dashboard.blueprint';
import { leadsAndCustomersBlueprint } from '../blueprints/leads-and-customers.blueprint';
import { opsCommandCenterBlueprint } from '../blueprints/ops-command-center.blueprint';
import { ordersDashboardBlueprint } from '../blueprints/orders-dashboard.blueprint';
import { paymentsDashboardBlueprint } from '../blueprints/payments-dashboard.blueprint';
import { riskExceptionsDashboardBlueprint } from '../blueprints/risk-exceptions-dashboard.blueprint';

type ApplyDashboardBlueprintDbCliArgs = {
  blueprint: string;
  createDashboard: boolean;
};

type ParseCliArgsResult =
  | {
      success: true;
      args: ApplyDashboardBlueprintDbCliArgs;
    }
  | {
      success: false;
      error: string;
    };

type DashboardRecord = {
  id: string;
  title: string;
  pageLayoutId: string;
};

type PageLayoutTabRecord = {
  id: string;
  title: string;
  position: number;
};

type ViewRecord = {
  id: string;
  name: string;
};

type ResolvedFieldMetadata = {
  id: string;
  name: string;
};

type ResolvedObjectMetadata = {
  id: string;
  nameSingular: string;
  fieldsByName: Record<string, ResolvedFieldMetadata>;
};

type WorkspaceContext = {
  workspaceId: string;
  applicationId: string;
  dashboardTableSql: string;
};

type DashboardApplyDbResult = {
  dashboard: {
    id: string;
    title: string;
  };
  createdTabs: string[];
  createdViews: string[];
  createdWidgets: string[];
  updatedWidgets: string[];
  skippedWidgets: string[];
};

const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-64aa-4b6f-b003-9c74b97cee20';

const SYSTEM_ACTOR = {
  source: 'SYSTEM',
  workspaceMemberId: null,
  name: 'System',
  context: {},
};

const getFirstRowOrThrow = <T>(rows: T[], message: string): T => {
  const row = rows[0];

  if (!row) {
    throw new Error(message);
  }

  return row;
};

const uuidToBase36 = (uuid: string): string => {
  const hex = uuid.replace(/-/g, '');

  return BigInt(`0x${hex}`).toString(36);
};

const getArgumentValue = (
  argv: string[],
  index: number,
): string | undefined => {
  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    return undefined;
  }

  return value;
};

const parseApplyDashboardBlueprintDbCliArgs = (
  argv: string[],
): ParseCliArgsResult => {
  const args: ApplyDashboardBlueprintDbCliArgs = {
    blueprint: 'ambassador-command-center',
    createDashboard: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--blueprint') {
      const blueprint = getArgumentValue(argv, index);

      if (!blueprint) {
        return {
          success: false,
          error: '--blueprint requires a blueprint key',
        };
      }

      args.blueprint = blueprint;
      index += 1;
      continue;
    }

    if (token === '--create-dashboard') {
      args.createDashboard = true;
    }
  }

  return {
    success: true,
    args,
  };
};

const dashboardBlueprints: Record<string, DashboardBlueprint> = {
  'ambassador-command-center': ambassadorCommandCenterBlueprint,
  'leads-and-customers': leadsAndCustomersBlueprint,
  'ops-command-center': opsCommandCenterBlueprint,
  'orders-dashboard': ordersDashboardBlueprint,
  'payments-dashboard': paymentsDashboardBlueprint,
  'fulfillment-dashboard': fulfillmentDashboardBlueprint,
  'risk-exceptions-dashboard': riskExceptionsDashboardBlueprint,
  'comp-integrity-dashboard': compIntegrityDashboardBlueprint,
  'support-dashboard': supportDashboardBlueprint,
};

const quoteIdentifier = (identifier: string): string => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }

  return `"${identifier}"`;
};

const resolveWorkspaceSchema = (): string => {
  const workspaceSchema = process.env.TWENTY_WORKSPACE_SCHEMA;

  if (!workspaceSchema) {
    throw new Error('Missing TWENTY_WORKSPACE_SCHEMA environment variable');
  }

  if (!/^workspace_[a-z0-9]+$/.test(workspaceSchema)) {
    throw new Error(
      `TWENTY_WORKSPACE_SCHEMA must match workspace_<base36>, received ${workspaceSchema}`,
    );
  }

  return workspaceSchema;
};

const createPool = (): Pool => {
  const connectionString = process.env.TWENTY_DB_DSN;

  if (!connectionString) {
    throw new Error('Missing TWENTY_DB_DSN environment variable');
  }

  return new Pool({
    connectionString,
    max: 1,
  });
};

const resolveWorkspaceContext = async (
  client: PoolClient,
  workspaceSchema: string,
): Promise<WorkspaceContext> => {
  const workspaceRows = await client.query<{ id: string }>(
    'SELECT id FROM core."workspace" WHERE "deletedAt" IS NULL',
  );
  const expectedSuffix = workspaceSchema.replace(/^workspace_/, '');
  const workspace = workspaceRows.rows.find(
    (row) => uuidToBase36(row.id) === expectedSuffix,
  );

  if (!workspace) {
    throw new Error(
      `Unable to resolve workspace for schema ${workspaceSchema}`,
    );
  }

  const applicationRows = await client.query<{ id: string }>(
    `SELECT id
       FROM core."application"
      WHERE "universalIdentifier" = $1
        AND "workspaceId" = $2
        AND "deletedAt" IS NULL`,
    [STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER, workspace.id],
  );
  const application = getFirstRowOrThrow(
    applicationRows.rows,
    `Unable to resolve standard application for workspace ${workspace.id}`,
  );

  return {
    workspaceId: workspace.id,
    applicationId: application.id,
    dashboardTableSql: `${quoteIdentifier(workspaceSchema)}.${quoteIdentifier(
      'dashboard',
    )}`,
  };
};

const getObjectMetadataMap = async (
  client: PoolClient,
  workspaceId: string,
): Promise<Record<string, ResolvedObjectMetadata>> => {
  const metadataRows = await client.query<{
    objectId: string;
    nameSingular: string;
    fieldId: string | null;
    fieldName: string | null;
  }>(
    `SELECT om.id AS "objectId",
            om."nameSingular" AS "nameSingular",
            fm.id AS "fieldId",
            fm.name AS "fieldName"
       FROM core."objectMetadata" om
       LEFT JOIN core."fieldMetadata" fm
         ON fm."objectMetadataId" = om.id
        AND fm."workspaceId" = $1
        AND fm."deletedAt" IS NULL
      WHERE om."workspaceId" = $1
        AND om."deletedAt" IS NULL`,
    [workspaceId],
  );

  const objectMetadataMap: Record<string, ResolvedObjectMetadata> = {};

  for (const row of metadataRows.rows) {
    const objectMetadata =
      objectMetadataMap[row.nameSingular] ??
      (objectMetadataMap[row.nameSingular] = {
        id: row.objectId,
        nameSingular: row.nameSingular,
        fieldsByName: {},
      });

    if (row.fieldId && row.fieldName) {
      objectMetadata.fieldsByName[row.fieldName] = {
        id: row.fieldId,
        name: row.fieldName,
      };
    }
  }

  return objectMetadataMap;
};

const resolveObjectMetadata = (
  objectMetadataMap: Record<string, ResolvedObjectMetadata>,
  objectNameSingular: string,
): ResolvedObjectMetadata => {
  const objectMetadata = objectMetadataMap[objectNameSingular];

  if (!objectMetadata) {
    throw new Error(`Object ${objectNameSingular} was not found in metadata`);
  }

  return objectMetadata;
};

const resolveFieldId = (
  objectMetadata: ResolvedObjectMetadata,
  fieldName: string,
): string => {
  const fieldMetadata = objectMetadata.fieldsByName[fieldName];

  if (!fieldMetadata) {
    throw new Error(
      `Field ${fieldName} was not found on ${objectMetadata.nameSingular}`,
    );
  }

  return fieldMetadata.id;
};

const findDashboardByTitle = async (
  client: PoolClient,
  dashboardTableSql: string,
  title: string,
): Promise<DashboardRecord | null> => {
  const result = await client.query<{
    id: string;
    title: string;
    pageLayoutId: string | null;
  }>(
    `SELECT id, title, "pageLayoutId"
       FROM ${dashboardTableSql}
      WHERE title = $1
        AND "deletedAt" IS NULL
      LIMIT 1`,
    [title],
  );
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  if (!row.pageLayoutId) {
    throw new Error(`Dashboard ${title} is missing a pageLayoutId`);
  }

  return {
    id: row.id,
    title: row.title,
    pageLayoutId: row.pageLayoutId,
  };
};

const createPageLayout = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  title: string,
): Promise<string> => {
  const pageLayoutId = randomUUID();

  await client.query(
    `INSERT INTO core."pageLayout" (
       id,
       name,
       type,
       "workspaceId",
       "universalIdentifier",
       "applicationId"
     ) VALUES ($1, $2, 'DASHBOARD', $3, $4, $5)`,
    [
      pageLayoutId,
      title,
      workspaceContext.workspaceId,
      randomUUID(),
      workspaceContext.applicationId,
    ],
  );

  return pageLayoutId;
};

const createDashboardRecord = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  title: string,
  pageLayoutId: string,
): Promise<DashboardRecord> => {
  const dashboardId = randomUUID();
  const result = await client.query<{
    id: string;
    title: string;
    pageLayoutId: string;
  }>(
    `INSERT INTO ${workspaceContext.dashboardTableSql} (
       id,
       title,
       "pageLayoutId",
       position,
       "createdBy",
       "updatedBy"
     ) VALUES (
       $1,
       $2,
       $3,
       0,
       $4::jsonb,
       $4::jsonb
     )
     RETURNING id, title, "pageLayoutId"`,
    [dashboardId, title, pageLayoutId, SYSTEM_ACTOR],
  );

  return getFirstRowOrThrow(
    result.rows,
    `Failed to create dashboard ${title}`,
  );
};

const ensureDashboard = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  blueprint: DashboardBlueprint,
  createDashboard: boolean,
): Promise<DashboardRecord> => {
  const existingDashboard = await findDashboardByTitle(
    client,
    workspaceContext.dashboardTableSql,
    blueprint.title,
  );

  if (existingDashboard) {
    return existingDashboard;
  }

  if (!createDashboard) {
    throw new Error(
      `Dashboard ${blueprint.title} was not found. Pass --create-dashboard.`,
    );
  }

  const pageLayoutId = await createPageLayout(
    client,
    workspaceContext,
    blueprint.title,
  );

  return createDashboardRecord(
    client,
    workspaceContext,
    blueprint.title,
    pageLayoutId,
  );
};

const findPageLayoutTab = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  pageLayoutId: string,
  title: string,
): Promise<PageLayoutTabRecord | null> => {
  const result = await client.query<PageLayoutTabRecord>(
    `SELECT id, title, position
       FROM core."pageLayoutTab"
      WHERE "workspaceId" = $1
        AND "pageLayoutId" = $2
        AND title = $3
        AND "deletedAt" IS NULL
      LIMIT 1`,
    [workspaceContext.workspaceId, pageLayoutId, title],
  );

  return result.rows[0] ?? null;
};

const updatePageLayoutTabPosition = async (
  client: PoolClient,
  tabId: string,
  position: number,
): Promise<void> => {
  await client.query(
    `UPDATE core."pageLayoutTab"
        SET position = $1,
            "updatedAt" = NOW()
      WHERE id = $2`,
    [position, tabId],
  );
};

const createPageLayoutTab = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  pageLayoutId: string,
  tabBlueprint: DashboardTabBlueprint,
): Promise<PageLayoutTabRecord> => {
  const result = await client.query<PageLayoutTabRecord>(
    `INSERT INTO core."pageLayoutTab" (
       id,
       title,
       position,
       "pageLayoutId",
       "layoutMode",
       "workspaceId",
       "universalIdentifier",
       "applicationId"
     ) VALUES ($1, $2, $3, $4, 'GRID', $5, $6, $7)
     RETURNING id, title, position`,
    [
      randomUUID(),
      tabBlueprint.title,
      tabBlueprint.position,
      pageLayoutId,
      workspaceContext.workspaceId,
      randomUUID(),
      workspaceContext.applicationId,
    ],
  );

  return getFirstRowOrThrow(
    result.rows,
    `Failed to create tab ${tabBlueprint.title}`,
  );
};

const ensurePageLayoutTab = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  pageLayoutId: string,
  tabBlueprint: DashboardTabBlueprint,
): Promise<{ tab: PageLayoutTabRecord; created: boolean }> => {
  const existingTab = await findPageLayoutTab(
    client,
    workspaceContext,
    pageLayoutId,
    tabBlueprint.title,
  );

  if (!existingTab) {
    return {
      tab: await createPageLayoutTab(
        client,
        workspaceContext,
        pageLayoutId,
        tabBlueprint,
      ),
      created: true,
    };
  }

  if (existingTab.position !== tabBlueprint.position) {
    await updatePageLayoutTabPosition(client, existingTab.id, tabBlueprint.position);

    return {
      tab: {
        ...existingTab,
        position: tabBlueprint.position,
      },
      created: false,
    };
  }

  return {
    tab: existingTab,
    created: false,
  };
};

const getExistingWidgetsByTitle = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  pageLayoutTabId: string,
): Promise<Map<string, { id: string; title: string }>> => {
  const result = await client.query<{ id: string; title: string }>(
    `SELECT id, title
       FROM core."pageLayoutWidget"
      WHERE "workspaceId" = $1
        AND "pageLayoutTabId" = $2
        AND "deletedAt" IS NULL`,
    [workspaceContext.workspaceId, pageLayoutTabId],
  );

  return new Map(result.rows.map((row) => [row.title, row]));
};

const findView = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  name: string,
  objectMetadataId: string,
): Promise<ViewRecord | null> => {
  const result = await client.query<ViewRecord>(
    `SELECT id, name
       FROM core."view"
      WHERE "workspaceId" = $1
        AND name = $2
        AND "objectMetadataId" = $3
        AND "deletedAt" IS NULL
      LIMIT 1`,
    [workspaceContext.workspaceId, name, objectMetadataId],
  );

  return result.rows[0] ?? null;
};

const createView = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  objectMetadataId: string,
  widgetBlueprint: DashboardRecordTableWidgetBlueprint,
): Promise<ViewRecord> => {
  const result = await client.query<ViewRecord>(
    `INSERT INTO core."view" (
       id,
       name,
       "objectMetadataId",
       type,
       icon,
       position,
       "isCompact",
       "isCustom",
       "openRecordIn",
       visibility,
       "workspaceId",
       "universalIdentifier",
       "applicationId"
     ) VALUES (
       $1,
       $2,
       $3,
       'TABLE',
       $4,
       $5,
       false,
       true,
       'SIDE_PANEL',
       'WORKSPACE',
       $6,
       $7,
       $8
     )
     RETURNING id, name`,
    [
      randomUUID(),
      widgetBlueprint.view.name,
      objectMetadataId,
      widgetBlueprint.view.icon,
      widgetBlueprint.view.position ?? 0,
      workspaceContext.workspaceId,
      randomUUID(),
      workspaceContext.applicationId,
    ],
  );

  return getFirstRowOrThrow(
    result.rows,
    `Failed to create view ${widgetBlueprint.view.name}`,
  );
};

const updateView = async (
  client: PoolClient,
  viewId: string,
  widgetBlueprint: DashboardRecordTableWidgetBlueprint,
): Promise<void> => {
  await client.query(
    `UPDATE core."view"
        SET icon = $1,
            position = $2,
            "updatedAt" = NOW()
      WHERE id = $3`,
    [
      widgetBlueprint.view.icon,
      widgetBlueprint.view.position ?? 0,
      viewId,
    ],
  );
};

const ensureViewFields = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  viewId: string,
  objectMetadata: ResolvedObjectMetadata,
  widgetBlueprint: DashboardRecordTableWidgetBlueprint,
): Promise<void> => {
  const existingFields = await client.query<{
    id: string;
    fieldMetadataId: string;
    isVisible: boolean;
    size: string | number | null;
    position: number;
  }>(
    `SELECT id, "fieldMetadataId", "isVisible", size, position
       FROM core."viewField"
      WHERE "workspaceId" = $1
        AND "viewId" = $2
        AND "deletedAt" IS NULL`,
    [workspaceContext.workspaceId, viewId],
  );
  const existingFieldsByMetadataId = new Map(
    existingFields.rows.map((row) => [row.fieldMetadataId, row]),
  );

  for (const fieldBlueprint of widgetBlueprint.view.fields) {
    const fieldMetadataId = resolveFieldId(
      objectMetadata,
      fieldBlueprint.fieldName,
    );
    const existingField = existingFieldsByMetadataId.get(fieldMetadataId);
    const isVisible = fieldBlueprint.isVisible ?? true;

    if (existingField) {
      if (
        existingField.isVisible !== isVisible ||
        existingField.size !== fieldBlueprint.size ||
        existingField.position !== fieldBlueprint.position
      ) {
        await client.query(
          `UPDATE core."viewField"
              SET "isVisible" = $1,
                  size = $2,
                  position = $3,
                  "updatedAt" = NOW()
            WHERE id = $4`,
          [isVisible, fieldBlueprint.size, fieldBlueprint.position, existingField.id],
        );
      }

      continue;
    }

    await client.query(
      `INSERT INTO core."viewField" (
         id,
         "fieldMetadataId",
         "isVisible",
         size,
         position,
         "viewId",
         "workspaceId",
         "universalIdentifier",
         "applicationId"
       ) VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9
       )
       ON CONFLICT ("fieldMetadataId", "viewId")
       WHERE "deletedAt" IS NULL
       DO NOTHING`,
      [
        randomUUID(),
        fieldMetadataId,
        isVisible,
        fieldBlueprint.size,
        fieldBlueprint.position,
        viewId,
        workspaceContext.workspaceId,
        randomUUID(),
        workspaceContext.applicationId,
      ],
    );
  }
};

const ensureView = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  objectMetadata: ResolvedObjectMetadata,
  widgetBlueprint: DashboardRecordTableWidgetBlueprint,
): Promise<{ view: ViewRecord; created: boolean }> => {
  let view = await findView(
    client,
    workspaceContext,
    widgetBlueprint.view.name,
    objectMetadata.id,
  );
  let created = false;

  if (!view) {
    view = await createView(
      client,
      workspaceContext,
      objectMetadata.id,
      widgetBlueprint,
    );
    created = true;
  } else {
    await updateView(client, view.id, widgetBlueprint);
  }

  await ensureViewFields(
    client,
    workspaceContext,
    view.id,
    objectMetadata,
    widgetBlueprint,
  );

  return { view, created };
};

const buildGraphConfiguration = (
  objectMetadata: ResolvedObjectMetadata,
  widgetBlueprint: DashboardGraphWidgetBlueprint,
): Record<string, unknown> => {
  const configuration = widgetBlueprint.configuration;

  if (configuration.configurationType === 'AGGREGATE_CHART') {
    return {
      configurationType: configuration.configurationType,
      aggregateFieldMetadataId: resolveFieldId(
        objectMetadata,
        configuration.aggregateFieldName,
      ),
      aggregateOperation: configuration.aggregateOperation,
      label: configuration.label,
      displayDataLabel: configuration.displayDataLabel,
      prefix: configuration.prefix,
      suffix: configuration.suffix,
      filter: configuration.filter,
    };
  }

  if (configuration.configurationType === 'PIE_CHART') {
    return {
      configurationType: configuration.configurationType,
      aggregateFieldMetadataId: resolveFieldId(
        objectMetadata,
        configuration.aggregateFieldName,
      ),
      aggregateOperation: configuration.aggregateOperation,
      groupByFieldMetadataId: resolveFieldId(
        objectMetadata,
        configuration.groupByFieldName,
      ),
      orderBy: configuration.orderBy,
      displayDataLabel: configuration.displayDataLabel,
      showCenterMetric: configuration.showCenterMetric,
      displayLegend: configuration.displayLegend,
      hideEmptyCategory: configuration.hideEmptyCategory,
      color: configuration.color,
      description: configuration.description,
      filter: configuration.filter,
    };
  }

  return {
    configurationType: configuration.configurationType,
    aggregateFieldMetadataId: resolveFieldId(
      objectMetadata,
      configuration.aggregateFieldName,
    ),
    aggregateOperation: configuration.aggregateOperation,
    primaryAxisGroupByFieldMetadataId: resolveFieldId(
      objectMetadata,
      configuration.primaryAxisGroupByFieldName,
    ),
    primaryAxisOrderBy: configuration.primaryAxisOrderBy,
    axisNameDisplay: configuration.axisNameDisplay,
    displayDataLabel: configuration.displayDataLabel,
    displayLegend: configuration.displayLegend,
    color: configuration.color,
    description: configuration.description,
    filter: configuration.filter,
    timezone: configuration.timezone,
    firstDayOfTheWeek: configuration.firstDayOfTheWeek,
  };
};

const createWidget = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  pageLayoutTabId: string,
  objectMetadataId: string,
  widgetBlueprint: DashboardWidgetBlueprint,
  configuration: Record<string, unknown>,
): Promise<string> => {
  const result = await client.query<{ id: string }>(
    `INSERT INTO core."pageLayoutWidget" (
       id,
       "pageLayoutTabId",
       title,
       type,
       "objectMetadataId",
       "gridPosition",
       position,
       configuration,
       "workspaceId",
       "universalIdentifier",
       "applicationId"
     ) VALUES (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6::jsonb,
       $7::jsonb,
       $8::jsonb,
       $9,
       $10,
       $11
     )
     RETURNING id`,
    [
      randomUUID(),
      pageLayoutTabId,
      widgetBlueprint.title,
      widgetBlueprint.type,
      objectMetadataId,
      widgetBlueprint.gridPosition,
      {
        layoutMode: 'GRID',
        ...widgetBlueprint.gridPosition,
      },
      configuration,
      workspaceContext.workspaceId,
      randomUUID(),
      workspaceContext.applicationId,
    ],
  );

  return getFirstRowOrThrow(
    result.rows,
    `Failed to create widget ${widgetBlueprint.title}`,
  ).id;
};

const updateWidget = async (
  client: PoolClient,
  widgetId: string,
  objectMetadataId: string,
  widgetBlueprint: DashboardWidgetBlueprint,
  configuration: Record<string, unknown>,
): Promise<void> => {
  await client.query(
    `UPDATE core."pageLayoutWidget"
        SET "objectMetadataId" = $1,
            type = $2,
            "gridPosition" = $3::jsonb,
            position = $4::jsonb,
            configuration = $5::jsonb,
            "updatedAt" = NOW()
      WHERE id = $6`,
    [
      objectMetadataId,
      widgetBlueprint.type,
      widgetBlueprint.gridPosition,
      {
        layoutMode: 'GRID',
        ...widgetBlueprint.gridPosition,
      },
      configuration,
      widgetId,
    ],
  );
};

const applyTabBlueprint = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  pageLayoutId: string,
  objectMetadataMap: Record<string, ResolvedObjectMetadata>,
  tabBlueprint: DashboardTabBlueprint,
): Promise<{
  createdTabs: string[];
  createdViews: string[];
  createdWidgets: string[];
  updatedWidgets: string[];
  skippedWidgets: string[];
}> => {
  const createdTabs: string[] = [];
  const createdViews: string[] = [];
  const createdWidgets: string[] = [];
  const updatedWidgets: string[] = [];
  const skippedWidgets: string[] = [];
  const { tab, created } = await ensurePageLayoutTab(
    client,
    workspaceContext,
    pageLayoutId,
    tabBlueprint,
  );

  if (created) {
    createdTabs.push(tab.title);
  }

  const existingWidgetsByTitle = await getExistingWidgetsByTitle(
    client,
    workspaceContext,
    tab.id,
  );

  for (const widgetBlueprint of tabBlueprint.widgets) {
    const objectMetadata = resolveObjectMetadata(
      objectMetadataMap,
      widgetBlueprint.objectNameSingular,
    );
    let configuration: Record<string, unknown>;

    if (widgetBlueprint.type === 'RECORD_TABLE') {
      const { view, created: createdView } = await ensureView(
        client,
        workspaceContext,
        objectMetadata,
        widgetBlueprint,
      );

      if (createdView) {
        createdViews.push(view.name);
      }

      configuration = {
        configurationType: 'RECORD_TABLE',
        viewId: view.id,
      };
    } else {
      configuration = buildGraphConfiguration(objectMetadata, widgetBlueprint);
    }

    const existingWidget = existingWidgetsByTitle.get(widgetBlueprint.title);

    if (existingWidget) {
      await updateWidget(
        client,
        existingWidget.id,
        objectMetadata.id,
        widgetBlueprint,
        configuration,
      );

      updatedWidgets.push(`${widgetBlueprint.title} (${existingWidget.id})`);
      continue;
    }

    const widgetId = await createWidget(
      client,
      workspaceContext,
      tab.id,
      objectMetadata.id,
      widgetBlueprint,
      configuration,
    );

    createdWidgets.push(`${widgetBlueprint.title} (${widgetId})`);
    existingWidgetsByTitle.set(widgetBlueprint.title, {
      id: widgetId,
      title: widgetBlueprint.title,
    });
  }

  return {
    createdTabs,
    createdViews,
    createdWidgets,
    updatedWidgets,
    skippedWidgets,
  };
};

const applyDashboardBlueprintDb = async (
  client: PoolClient,
  workspaceContext: WorkspaceContext,
  blueprint: DashboardBlueprint,
  createDashboard: boolean,
): Promise<DashboardApplyDbResult> => {
  const dashboard = await ensureDashboard(
    client,
    workspaceContext,
    blueprint,
    createDashboard,
  );
  const objectMetadataMap = await getObjectMetadataMap(
    client,
    workspaceContext.workspaceId,
  );
  const result: DashboardApplyDbResult = {
    dashboard: {
      id: dashboard.id,
      title: dashboard.title,
    },
    createdTabs: [],
    createdViews: [],
    createdWidgets: [],
    updatedWidgets: [],
    skippedWidgets: [],
  };

  for (const tabBlueprint of blueprint.tabs) {
    const tabResult = await applyTabBlueprint(
      client,
      workspaceContext,
      dashboard.pageLayoutId,
      objectMetadataMap,
      tabBlueprint,
    );

    result.createdTabs.push(...tabResult.createdTabs);
    result.createdViews.push(...tabResult.createdViews);
    result.createdWidgets.push(...tabResult.createdWidgets);
    result.updatedWidgets.push(...tabResult.updatedWidgets);
    result.skippedWidgets.push(...tabResult.skippedWidgets);
  }

  return result;
};

export const executeApplyDashboardBlueprintDbCli = async (
  argv: string[],
): Promise<void> => {
  const parsedArgs = parseApplyDashboardBlueprintDbCliArgs(argv);

  if (parsedArgs.success === false) {
    throw new Error(parsedArgs.error);
  }

  const blueprint = dashboardBlueprints[parsedArgs.args.blueprint];

  if (!blueprint) {
    throw new Error(
      `Unknown blueprint ${parsedArgs.args.blueprint}. Available: ${Object.keys(
        dashboardBlueprints,
      ).join(', ')}`,
    );
  }

  const workspaceSchema = resolveWorkspaceSchema();
  const pool = createPool();

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const workspaceContext = await resolveWorkspaceContext(
        client,
        workspaceSchema,
      );
      const result = await applyDashboardBlueprintDb(
        client,
        workspaceContext,
        blueprint,
        parsedArgs.args.createDashboard,
      );

      await client.query('COMMIT');
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
};

const main = async (): Promise<void> => {
  await executeApplyDashboardBlueprintDbCli(process.argv.slice(2));
};

const isExecutedDirectly = (): boolean => {
  if (!process.argv[1]) {
    return false;
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (isExecutedDirectly()) {
  main().catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown dashboard blueprint error';
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
}
