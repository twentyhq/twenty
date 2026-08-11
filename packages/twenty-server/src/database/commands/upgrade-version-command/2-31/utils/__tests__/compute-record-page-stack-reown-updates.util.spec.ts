import { getSystemRecordPageLayoutUniversalIdentifier } from 'twenty-shared/application';

import {
  buildByUniversalIdentifierMap,
  buildUnderivedRecordPageStack,
  CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  FIELD_UNIVERSAL_IDENTIFIER,
  STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  WORKSPACE_ID,
} from 'src/database/commands/upgrade-version-command/2-31/__tests__/record-page-reconcile-test-setup';
import { computeRecordPageStackReownUpdates } from 'src/database/commands/upgrade-version-command/2-31/utils/compute-record-page-stack-reown-updates.util';
import { countRecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-31/utils/count-record-page-reown-updates.util';

const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000bb';

const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const FIELD_METADATA = {
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

describe('computeRecordPageStackReownUpdates', () => {
  let warnMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    warnMock = jest.fn();
  });

  const buildStack = () =>
    buildUnderivedRecordPageStack({
      idPrefix: 'stack',
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      withGroup: true,
    });

  const runCompute = ({
    stack,
    extraTabs = [] as Record<string, unknown>[],
    extraWidgets = [] as Record<string, unknown>[],
    extraViews = [] as Record<string, unknown>[],
    fieldMetadatas = [FIELD_METADATA],
    pageLayoutOverride = {} as Record<string, unknown>,
  }: {
    stack: ReturnType<typeof buildStack>;
    extraTabs?: Record<string, unknown>[];
    extraWidgets?: Record<string, unknown>[];
    extraViews?: Record<string, unknown>[];
    fieldMetadatas?: Record<string, unknown>[];
    pageLayoutOverride?: Record<string, unknown>;
  }) => {
    const flatPageLayout = {
      ...stack.pageLayout,
      ...pageLayoutOverride,
    };

    return computeRecordPageStackReownUpdates({
      workspaceId: WORKSPACE_ID,
      logger: { warn: warnMock },
      flatObjectMetadata: OBJECT_METADATA,
      flatPageLayout,
      derivedPageLayoutUniversalIdentifier:
        DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      engineOwnedApplicationUniversalIdentifiers: new Set([
        STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      ]),
      twentyStandardApplicationUniversalIdentifier:
        STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatViewMaps: buildByUniversalIdentifierMap([
        stack.view,
        ...extraViews,
      ] as never),
      flatViewFieldMaps: buildByUniversalIdentifierMap([
        stack.viewField,
      ] as never),
      flatViewFieldGroupMaps: buildByUniversalIdentifierMap(
        stack.viewFieldGroup ? ([stack.viewFieldGroup] as never) : [],
      ),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(
        fieldMetadatas as never,
      ),
      flatPageLayoutMaps: buildByUniversalIdentifierMap([
        flatPageLayout,
      ] as never),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap([
        stack.homeTab,
        ...extraTabs,
      ] as never),
      flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap([
        stack.fieldsWidget,
        ...extraWidgets,
      ] as never),
    } as never);
  };

  it('re-owns the full underived stack without warnings', () => {
    const stack = buildStack();

    const reownUpdates = runCompute({ stack });

    expect(warnMock).not.toHaveBeenCalled();
    expect(reownUpdates.pageLayoutUpdates).toHaveLength(1);
    expect(reownUpdates.pageLayoutTabUpdates).toHaveLength(1);
    expect(reownUpdates.pageLayoutWidgetUpdates).toHaveLength(1);
    expect(reownUpdates.viewUpdates).toHaveLength(1);
    expect(reownUpdates.viewFieldUpdates).toHaveLength(1);
    expect(reownUpdates.viewFieldGroupUpdates).toHaveLength(1);
  });

  it('skips the second tab claiming the same title with a warning', () => {
    const stack = buildStack();
    const duplicateTab = {
      ...stack.homeTab,
      id: 'duplicate-tab-db-id',
      universalIdentifier: 'duplicate-tab-universal-identifier',
      widgetUniversalIdentifiers: [],
    };

    stack.pageLayout.tabUniversalIdentifiers.push(
      duplicateTab.universalIdentifier,
    );

    const reownUpdates = runCompute({ stack, extraTabs: [duplicateTab] });

    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate tab title "Home"'),
    );
    expect(reownUpdates.pageLayoutTabUpdates).toHaveLength(1);
    expect(reownUpdates.pageLayoutTabUpdates[0].id).toBe(stack.homeTab.id);
  });

  it('skips the second widget claiming the same title on a tab with a warning', () => {
    const stack = buildStack();
    const duplicateWidget = {
      ...stack.fieldsWidget,
      id: 'duplicate-widget-db-id',
      universalIdentifier: 'duplicate-widget-universal-identifier',
    };

    stack.homeTab.widgetUniversalIdentifiers.push(
      duplicateWidget.universalIdentifier,
    );

    const reownUpdates = runCompute({ stack, extraWidgets: [duplicateWidget] });

    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate widget title "Fields"'),
    );
    expect(reownUpdates.pageLayoutWidgetUpdates).toHaveLength(1);
    expect(reownUpdates.pageLayoutWidgetUpdates[0].id).toBe(
      stack.fieldsWidget.id,
    );
  });

  it('warns on a dangling FIELDS widget view and skips the view branch', () => {
    const stack = buildStack();

    stack.fieldsWidget.configuration.viewId = 'unknown-view-db-id';

    const reownUpdates = runCompute({ stack });

    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining('Dangling FIELDS widget view unknown-view-db-id'),
    );
    expect(reownUpdates.viewUpdates).toHaveLength(0);
    expect(reownUpdates.viewFieldUpdates).toHaveLength(0);
    // The widget itself is still re-owned.
    expect(reownUpdates.pageLayoutWidgetUpdates).toHaveLength(1);
  });

  it('warns and skips a view field whose displayed field is missing', () => {
    const stack = buildStack();

    const reownUpdates = runCompute({ stack, fieldMetadatas: [] });

    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining(
        `Missing field for record-page view field ${stack.viewField.id}`,
      ),
    );
    expect(reownUpdates.viewFieldUpdates).toHaveLength(0);
    expect(reownUpdates.viewUpdates).toHaveLength(1);
  });

  it('warns and skips a row whose derived identifier is already held by another row', () => {
    const stack = buildStack();
    const identifierHolderView = {
      ...stack.view,
      id: 'holder-view-db-id',
      universalIdentifier: 'holder-view-universal-identifier',
      viewFieldUniversalIdentifiers: [],
      viewFieldGroupUniversalIdentifiers: [],
    };

    // Another row already holds the layout's derived identifier.
    const reownUpdates = runCompute({
      stack,
      extraViews: [identifierHolderView],
      pageLayoutOverride: {},
    });

    // Sanity: the standard path stays warning-free; now collide on the layout.
    expect(warnMock).not.toHaveBeenCalled();
    expect(countRecordPageReownUpdates(reownUpdates)).toBeGreaterThan(0);

    const collidingLayoutHolder = {
      id: 'holder-layout-db-id',
      universalIdentifier: DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
    };
    const collidingStack = buildStack();

    const collidingReownUpdates = computeRecordPageStackReownUpdates({
      workspaceId: WORKSPACE_ID,
      logger: { warn: warnMock },
      flatObjectMetadata: OBJECT_METADATA,
      flatPageLayout: collidingStack.pageLayout,
      derivedPageLayoutUniversalIdentifier:
        DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      engineOwnedApplicationUniversalIdentifiers: new Set([
        STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      ]),
      twentyStandardApplicationUniversalIdentifier:
        STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatViewMaps: buildByUniversalIdentifierMap([
        collidingStack.view,
      ] as never),
      flatViewFieldMaps: buildByUniversalIdentifierMap([
        collidingStack.viewField,
      ] as never),
      flatViewFieldGroupMaps: buildByUniversalIdentifierMap(
        collidingStack.viewFieldGroup
          ? ([collidingStack.viewFieldGroup] as never)
          : [],
      ),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap([
        FIELD_METADATA,
      ] as never),
      flatPageLayoutMaps: buildByUniversalIdentifierMap([
        collidingStack.pageLayout,
        collidingLayoutHolder,
      ] as never),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap([
        collidingStack.homeTab,
      ] as never),
      flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap([
        collidingStack.fieldsWidget,
      ] as never),
    } as never);

    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining(
        `Derived universal identifier ${DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER} is already held by another row`,
      ),
    );
    expect(collidingReownUpdates.pageLayoutUpdates).toHaveLength(0);
  });

  it('skips the second standard group claiming the same name with a warning', () => {
    const stack = buildStack();
    const duplicateGroup = {
      ...stack.viewFieldGroup,
      id: 'duplicate-group-db-id',
      universalIdentifier: 'duplicate-group-universal-identifier',
    };

    stack.view.viewFieldGroupUniversalIdentifiers.push(
      duplicateGroup.universalIdentifier,
    );

    const reownUpdates = computeRecordPageStackReownUpdates({
      workspaceId: WORKSPACE_ID,
      logger: { warn: warnMock },
      flatObjectMetadata: OBJECT_METADATA,
      flatPageLayout: stack.pageLayout,
      derivedPageLayoutUniversalIdentifier:
        DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      engineOwnedApplicationUniversalIdentifiers: new Set([
        STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      ]),
      twentyStandardApplicationUniversalIdentifier:
        STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatViewMaps: buildByUniversalIdentifierMap([stack.view] as never),
      flatViewFieldMaps: buildByUniversalIdentifierMap([
        stack.viewField,
      ] as never),
      flatViewFieldGroupMaps: buildByUniversalIdentifierMap([
        stack.viewFieldGroup,
        duplicateGroup,
      ] as never),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap([
        FIELD_METADATA,
      ] as never),
      flatPageLayoutMaps: buildByUniversalIdentifierMap([
        stack.pageLayout,
      ] as never),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap([
        stack.homeTab,
      ] as never),
      flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap([
        stack.fieldsWidget,
      ] as never),
    } as never);

    expect(warnMock).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate view field group name "General"'),
    );
    expect(reownUpdates.viewFieldGroupUpdates).toHaveLength(1);
    expect(reownUpdates.viewFieldGroupUpdates[0].id).toBe(
      stack.viewFieldGroup?.id,
    );
  });

  it('leaves app-authored tabs attached to the engine layout untouched', () => {
    const stack = buildStack();
    const appAuthoredTab = {
      ...stack.homeTab,
      id: 'app-tab-db-id',
      universalIdentifier: 'app-tab-universal-identifier',
      title: 'Call Recording',
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      widgetUniversalIdentifiers: [],
    };

    stack.pageLayout.tabUniversalIdentifiers.push(
      appAuthoredTab.universalIdentifier,
    );

    const reownUpdates = runCompute({ stack, extraTabs: [appAuthoredTab] });

    expect(warnMock).not.toHaveBeenCalled();
    expect(reownUpdates.pageLayoutTabUpdates).toHaveLength(1);
    expect(reownUpdates.pageLayoutTabUpdates[0].id).toBe(stack.homeTab.id);
  });
});
