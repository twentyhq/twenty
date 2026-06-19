import type {
  DashboardBlueprint,
  DashboardGraphWidgetBlueprint,
  DashboardRecordTableWidgetBlueprint,
  DashboardTabBlueprint,
  DashboardWidgetBlueprint,
} from './dashboard-blueprint.type';

export type DashboardApplyApiConfig = {
  accessToken: string;
  baseUrl: string;
  schemaVersion: string;
};

export type DashboardApplyOptions = {
  dashboardId?: string;
  createDashboard?: boolean;
  tabs?: string[];
};

type PageLayoutWidgetSummary = {
  id: string;
  title: string;
  type: string;
};

type PageLayoutTabSummary = {
  id: string;
  title: string;
  position: number;
  widgets: PageLayoutWidgetSummary[];
};

type PageLayoutSummary = {
  id: string;
  name: string;
  tabs: PageLayoutTabSummary[];
};

type DashboardSummary = {
  id: string;
  title: string;
  pageLayoutId: string;
};

type ObjectFieldSummary = {
  id: string;
  name: string;
  label: string;
  type: string;
};

type ObjectMetadataSummary = {
  id: string;
  nameSingular: string;
  fieldsList: ObjectFieldSummary[];
};

type ViewSummary = {
  id: string;
  name: string;
};

type ViewFieldSummary = {
  id: string;
  fieldMetadataId: string;
  position: number;
  isVisible: boolean;
  size: number;
};

type ResolvedObjectMetadata = {
  id: string;
  fieldsByName: Record<string, ObjectFieldSummary>;
};

export type DashboardApplyResult = {
  dashboard: DashboardSummary;
  createdTabs: string[];
  updatedTabs: string[];
  createdViews: string[];
  createdViewFields: string[];
  createdWidgets: string[];
  skippedWidgets: string[];
};

const postJson = async <T>(
  url: string,
  accessToken: string,
  schemaVersion: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'x-locale': 'en',
      'x-schema-version': schemaVersion,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (body.errors && body.errors.length > 0) {
    throw new Error(body.errors.map((error) => error.message).join('\n'));
  }

  if (!body.data) {
    throw new Error(`Empty GraphQL response from ${url}`);
  }

  return body.data;
};

const getDashboard = async (
  apiConfig: DashboardApplyApiConfig,
  dashboardId: string,
): Promise<DashboardSummary> => {
  const data = await postJson<{
    dashboards: { edges: Array<{ node: DashboardSummary }> };
  }>(
    `${apiConfig.baseUrl}/graphql`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `query Dashboard($filter: DashboardFilterInput) {
      dashboards(filter: $filter) {
        edges {
          node {
            id
            title
            pageLayoutId
          }
        }
      }
    }`,
    {
      filter: {
        id: { eq: dashboardId },
      },
    },
  );

  const dashboard = data.dashboards.edges[0]?.node;

  if (!dashboard) {
    throw new Error(`Dashboard ${dashboardId} was not found`);
  }

  return dashboard;
};

const findDashboardByTitle = async (
  apiConfig: DashboardApplyApiConfig,
  title: string,
): Promise<DashboardSummary | null> => {
  const data = await postJson<{
    dashboards: { edges: Array<{ node: DashboardSummary }> };
  }>(
    `${apiConfig.baseUrl}/graphql`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `query DashboardsByTitle {
      dashboards(orderBy: { position: AscNullsFirst }) {
        edges {
          node {
            id
            title
            pageLayoutId
          }
        }
      }
    }`,
    {},
  );

  return (
    data.dashboards.edges
      .map((edge) => edge.node)
      .find((dashboard) => dashboard.title === title) ?? null
  );
};

const createPageLayout = async (
  apiConfig: DashboardApplyApiConfig,
  name: string,
): Promise<{ id: string; name: string; type: string }> => {
  const data = await postJson<{
    createPageLayout: { id: string; name: string; type: string };
  }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `mutation CreatePageLayout($input: CreatePageLayoutInput!) {
      createPageLayout(input: $input) {
        id
        name
        type
      }
    }`,
    {
      input: {
        name,
        type: 'DASHBOARD',
      },
    },
  );

  return data.createPageLayout;
};

const createDashboardRecord = async (
  apiConfig: DashboardApplyApiConfig,
  title: string,
  pageLayoutId: string,
): Promise<DashboardSummary> => {
  const data = await postJson<{
    createDashboard: DashboardSummary;
  }>(
    `${apiConfig.baseUrl}/graphql`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `mutation CreateDashboard($input: DashboardCreateInput!) {
      createDashboard(data: $input) {
        id
        title
        pageLayoutId
      }
    }`,
    {
      input: {
        title,
        pageLayoutId,
      },
    },
  );

  return data.createDashboard;
};

const ensureDashboard = async (
  blueprint: DashboardBlueprint,
  apiConfig: DashboardApplyApiConfig,
  options: DashboardApplyOptions,
): Promise<DashboardSummary> => {
  if (options.dashboardId) {
    return getDashboard(apiConfig, options.dashboardId);
  }

  const existingDashboard = await findDashboardByTitle(apiConfig, blueprint.title);

  if (existingDashboard) {
    return existingDashboard;
  }

  if (!options.createDashboard) {
    throw new Error(
      `Dashboard ${blueprint.title} was not found. Pass --dashboard-id or use --create-dashboard.`,
    );
  }

  const pageLayout = await createPageLayout(apiConfig, blueprint.title);

  return createDashboardRecord(apiConfig, blueprint.title, pageLayout.id);
};

const getPageLayout = async (
  apiConfig: DashboardApplyApiConfig,
  pageLayoutId: string,
): Promise<PageLayoutSummary> => {
  const data = await postJson<{ getPageLayout: PageLayoutSummary }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `query GetPageLayout($id: String!) {
      getPageLayout(id: $id) {
        id
        name
        tabs {
          id
          title
          position
          widgets {
            id
            title
            type
          }
        }
      }
    }`,
    { id: pageLayoutId },
  );

  return data.getPageLayout;
};

const updatePageLayoutTab = async (
  apiConfig: DashboardApplyApiConfig,
  tabId: string,
  position: number,
): Promise<void> => {
  await postJson(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `mutation UpdatePageLayoutTab($id: String!, $input: UpdatePageLayoutTabInput!) {
      updatePageLayoutTab(id: $id, input: $input) {
        id
      }
    }`,
    {
      id: tabId,
      input: { position },
    },
  );
};

const createPageLayoutTab = async (
  apiConfig: DashboardApplyApiConfig,
  pageLayoutId: string,
  tabBlueprint: DashboardTabBlueprint,
): Promise<PageLayoutTabSummary> => {
  const data = await postJson<{ createPageLayoutTab: PageLayoutTabSummary }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `mutation CreatePageLayoutTab($input: CreatePageLayoutTabInput!) {
      createPageLayoutTab(input: $input) {
        id
        title
        position
      }
    }`,
    {
      input: {
        title: tabBlueprint.title,
        position: tabBlueprint.position,
        pageLayoutId,
        layoutMode: 'GRID',
      },
    },
  );

  return {
    ...data.createPageLayoutTab,
    widgets: [],
  };
};

const getObjectMetadataMap = async (
  apiConfig: DashboardApplyApiConfig,
): Promise<Record<string, ResolvedObjectMetadata>> => {
  const data = await postJson<{
    objects: { edges: Array<{ node: ObjectMetadataSummary }> };
  }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `query Objects {
      objects(paging: { first: 1000 }) {
        edges {
          node {
            id
            nameSingular
            fieldsList {
              id
              name
              label
              type
            }
          }
        }
      }
    }`,
    {},
  );

  return Object.fromEntries(
    data.objects.edges.map(({ node }) => [
      node.nameSingular,
      {
        id: node.id,
        fieldsByName: Object.fromEntries(
          node.fieldsList.map((field) => [field.name, field]),
        ),
      },
    ]),
  );
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
  const field = objectMetadata.fieldsByName[fieldName];

  if (!field) {
    throw new Error(`Field ${fieldName} was not found on ${objectMetadata.id}`);
  }

  return field.id;
};

const getViews = async (
  apiConfig: DashboardApplyApiConfig,
  objectMetadataId: string,
): Promise<ViewSummary[]> => {
  const data = await postJson<{ getViews: ViewSummary[] }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `query GetViews($objectMetadataId: String!) {
      getViews(objectMetadataId: $objectMetadataId) {
        id
        name
      }
    }`,
    { objectMetadataId },
  );

  return data.getViews;
};

const createView = async (
  apiConfig: DashboardApplyApiConfig,
  objectMetadataId: string,
  widgetBlueprint: DashboardRecordTableWidgetBlueprint,
): Promise<ViewSummary> => {
  const data = await postJson<{ createView: ViewSummary }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `mutation CreateView($input: CreateViewInput!) {
      createView(input: $input) {
        id
        name
      }
    }`,
    {
      input: {
        name: widgetBlueprint.view.name,
        objectMetadataId,
        type: 'TABLE',
        icon: widgetBlueprint.view.icon,
        position: widgetBlueprint.view.position ?? 0,
        visibility: 'WORKSPACE',
        openRecordIn: 'SIDE_PANEL',
      },
    },
  );

  return data.createView;
};

const getViewFields = async (
  apiConfig: DashboardApplyApiConfig,
  viewId: string,
): Promise<ViewFieldSummary[]> => {
  const data = await postJson<{ getViewFields: ViewFieldSummary[] }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `query GetViewFields($viewId: String!) {
      getViewFields(viewId: $viewId) {
        id
        fieldMetadataId
        position
        isVisible
        size
      }
    }`,
    { viewId },
  );

  return data.getViewFields;
};

const createManyViewFields = async (
  apiConfig: DashboardApplyApiConfig,
  viewId: string,
  objectMetadata: ResolvedObjectMetadata,
  widgetBlueprint: DashboardRecordTableWidgetBlueprint,
): Promise<string[]> => {
  const existingFields = await getViewFields(apiConfig, viewId);
  const existingFieldIds = new Set(
    existingFields.map((viewField) => viewField.fieldMetadataId),
  );
  const inputs = widgetBlueprint.view.fields
    .map((fieldBlueprint) => ({
      fieldMetadataId: resolveFieldId(objectMetadata, fieldBlueprint.fieldName),
      isVisible: fieldBlueprint.isVisible ?? true,
      position: fieldBlueprint.position,
      size: fieldBlueprint.size,
      viewId,
    }))
    .filter((input) => !existingFieldIds.has(input.fieldMetadataId));

  if (inputs.length === 0) {
    return [];
  }

  const data = await postJson<{
    createManyViewFields: Array<{ id: string }>;
  }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `mutation CreateManyViewFields($inputs: [CreateViewFieldInput!]!) {
      createManyViewFields(inputs: $inputs) {
        id
      }
    }`,
    { inputs },
  );

  return data.createManyViewFields.map((viewField) => viewField.id);
};

const ensureView = async (
  apiConfig: DashboardApplyApiConfig,
  objectMetadata: ResolvedObjectMetadata,
  widgetBlueprint: DashboardRecordTableWidgetBlueprint,
): Promise<{ view: ViewSummary; createdViewFields: string[]; createdView: boolean }> => {
  const existingViews = await getViews(apiConfig, objectMetadata.id);
  let view = existingViews.find(
    (existingView) => existingView.name === widgetBlueprint.view.name,
  );
  let createdView = false;

  if (!view) {
    view = await createView(apiConfig, objectMetadata.id, widgetBlueprint);
    createdView = true;
  }

  const createdViewFields = await createManyViewFields(
    apiConfig,
    view.id,
    objectMetadata,
    widgetBlueprint,
  );

  return { view, createdViewFields, createdView };
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
  apiConfig: DashboardApplyApiConfig,
  tabId: string,
  objectMetadataMap: Record<string, ResolvedObjectMetadata>,
  widgetBlueprint: DashboardWidgetBlueprint,
): Promise<string> => {
  const objectMetadata = resolveObjectMetadata(
    objectMetadataMap,
    widgetBlueprint.objectNameSingular,
  );

  let configuration: Record<string, unknown>;

  if (widgetBlueprint.type === 'RECORD_TABLE') {
    const { view } = await ensureView(apiConfig, objectMetadata, widgetBlueprint);
    configuration = {
      configurationType: 'RECORD_TABLE',
      viewId: view.id,
    };
  } else {
    configuration = buildGraphConfiguration(objectMetadata, widgetBlueprint);
  }

  const data = await postJson<{
    createPageLayoutWidget: { id: string };
  }>(
    `${apiConfig.baseUrl}/metadata`,
    apiConfig.accessToken,
    apiConfig.schemaVersion,
    `mutation CreatePageLayoutWidget($input: CreatePageLayoutWidgetInput!) {
      createPageLayoutWidget(input: $input) {
        id
      }
    }`,
    {
      input: {
        pageLayoutTabId: tabId,
        title: widgetBlueprint.title,
        type: widgetBlueprint.type,
        objectMetadataId: objectMetadata.id,
        gridPosition: widgetBlueprint.gridPosition,
        position: {
          layoutMode: 'GRID',
          ...widgetBlueprint.gridPosition,
        },
        configuration,
      },
    },
  );

  return data.createPageLayoutWidget.id;
};

const applyTabBlueprint = async (
  apiConfig: DashboardApplyApiConfig,
  pageLayoutId: string,
  objectMetadataMap: Record<string, ResolvedObjectMetadata>,
  existingLayout: PageLayoutSummary,
  tabBlueprint: DashboardTabBlueprint,
): Promise<{
  createdTabs: string[];
  updatedTabs: string[];
  createdViews: string[];
  createdViewFields: string[];
  createdWidgets: string[];
  skippedWidgets: string[];
}> => {
  const createdTabs: string[] = [];
  const updatedTabs: string[] = [];
  const createdViews: string[] = [];
  const createdViewFields: string[] = [];
  const createdWidgets: string[] = [];
  const skippedWidgets: string[] = [];

  let tab = existingLayout.tabs.find(
    (existingTab) => existingTab.title === tabBlueprint.title,
  );

  if (!tab) {
    tab = await createPageLayoutTab(apiConfig, pageLayoutId, tabBlueprint);
    createdTabs.push(tab.title);
  } else if (tab.position !== tabBlueprint.position) {
    await updatePageLayoutTab(apiConfig, tab.id, tabBlueprint.position);
    updatedTabs.push(tab.title);
  }

  const existingWidgetTitles = new Set(tab.widgets.map((widget) => widget.title));

  for (const widgetBlueprint of tabBlueprint.widgets) {
    if (existingWidgetTitles.has(widgetBlueprint.title)) {
      skippedWidgets.push(widgetBlueprint.title);
      continue;
    }

    if (widgetBlueprint.type === 'RECORD_TABLE') {
      const objectMetadata = resolveObjectMetadata(
        objectMetadataMap,
        widgetBlueprint.objectNameSingular,
      );
      const { view, createdViewFields: newViewFieldIds, createdView } =
        await ensureView(apiConfig, objectMetadata, widgetBlueprint);

      if (createdView) {
        createdViews.push(view.name);
      }

      createdViewFields.push(...newViewFieldIds);
    }

    const widgetId = await createWidget(
      apiConfig,
      tab.id,
      objectMetadataMap,
      widgetBlueprint,
    );
    createdWidgets.push(`${widgetBlueprint.title} (${widgetId})`);
  }

  return {
    createdTabs,
    updatedTabs,
    createdViews,
    createdViewFields,
    createdWidgets,
    skippedWidgets,
  };
};

export const applyDashboardBlueprint = async (
  blueprint: DashboardBlueprint,
  apiConfig: DashboardApplyApiConfig,
  options: DashboardApplyOptions,
): Promise<DashboardApplyResult> => {
  const dashboard = await ensureDashboard(blueprint, apiConfig, options);

  if (dashboard.title !== blueprint.title) {
    throw new Error(
      `Dashboard title mismatch: expected ${blueprint.title}, got ${dashboard.title}`,
    );
  }

  const existingLayout = await getPageLayout(apiConfig, dashboard.pageLayoutId);
  const objectMetadataMap = await getObjectMetadataMap(apiConfig);
  const selectedTabs =
    options.tabs && options.tabs.length > 0
      ? blueprint.tabs.filter((tab) => options.tabs?.includes(tab.key))
      : blueprint.tabs;

  if (selectedTabs.length === 0) {
    throw new Error('No blueprint tabs selected for application');
  }

  const result: DashboardApplyResult = {
    dashboard,
    createdTabs: [],
    updatedTabs: [],
    createdViews: [],
    createdViewFields: [],
    createdWidgets: [],
    skippedWidgets: [],
  };

  let currentLayout = existingLayout;

  for (const tabBlueprint of selectedTabs) {
    const tabResult = await applyTabBlueprint(
      apiConfig,
      currentLayout.id,
      objectMetadataMap,
      currentLayout,
      tabBlueprint,
    );

    result.createdTabs.push(...tabResult.createdTabs);
    result.updatedTabs.push(...tabResult.updatedTabs);
    result.createdViews.push(...tabResult.createdViews);
    result.createdViewFields.push(...tabResult.createdViewFields);
    result.createdWidgets.push(...tabResult.createdWidgets);
    result.skippedWidgets.push(...tabResult.skippedWidgets);
    currentLayout = await getPageLayout(apiConfig, dashboard.pageLayoutId);
  }

  return result;
};
