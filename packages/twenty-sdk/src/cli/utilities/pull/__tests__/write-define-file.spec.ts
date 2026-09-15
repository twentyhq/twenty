import {
  FIELD_ENUM_BINDINGS,
  INDEX_ENUM_BINDINGS,
  NAVIGATION_MENU_ITEM_ENUM_BINDINGS,
  OBJECT_ENUM_BINDINGS,
  PAGE_LAYOUT_ENUM_BINDINGS,
  PAGE_LAYOUT_TAB_ENUM_BINDINGS,
  VIEW_ENUM_BINDINGS,
  VIEW_FIELD_ENUM_BINDINGS,
  writeDefineFile,
} from '@/cli/utilities/pull/write-define-file';
import { describe, expect, it } from 'vitest';

describe('writeDefineFile', () => {
  it('should write an enum-valued property as a symbol and import it', () => {
    const file = writeDefineFile({
      definer: 'defineField',
      config: {
        universalIdentifier: 'field-uid',
        type: 'TEXT',
        name: 'title',
        writability: 'OPEN',
      },
      enumBindings: FIELD_ENUM_BINDINGS,
    });

    expect(file).toContain(
      "import { defineField, FieldType, MetadataWritability } from 'twenty-sdk/define';",
    );
    expect(file).toContain('type: FieldType.TEXT,');
    expect(file).toContain('writability: MetadataWritability.OPEN,');
  });

  it('should look up an enum member whose name differs from its value', () => {
    const file = writeDefineFile({
      definer: 'defineField',
      config: {
        universalIdentifier: 'field-uid',
        type: 'NUMBER',
        universalSettings: { dataType: 'bigint' },
      },
      enumBindings: FIELD_ENUM_BINDINGS,
    });

    expect(file).toContain('dataType: NumberDataType.BIGINT,');
  });

  it('should leave a string that is not a member of the bound enum as a literal', () => {
    const file = writeDefineFile({
      definer: 'defineField',
      config: { universalIdentifier: 'field-uid', type: 'NOT_A_FIELD_TYPE' },
      enumBindings: FIELD_ENUM_BINDINGS,
    });

    expect(file).toContain("type: 'NOT_A_FIELD_TYPE',");
    expect(file).toContain("import { defineField } from 'twenty-sdk/define';");
  });

  it('should only bind enum properties at the declared path', () => {
    const file = writeDefineFile({
      definer: 'defineIndex',
      config: {
        universalIdentifier: 'index-uid',
        indexType: 'BTREE',
        fields: [{ fieldUniversalIdentifier: 'field-uid', indexType: 'BTREE' }],
      },
      enumBindings: INDEX_ENUM_BINDINGS,
    });

    expect(file).toContain('indexType: IndexType.BTREE,');
    expect(file).toContain("indexType: 'BTREE',");
  });

  it('should wrap the import statement when it grows past one line', () => {
    const file = writeDefineFile({
      definer: 'defineObject',
      config: {
        writability: 'OPEN',
        openRecordIn: 'USER_CHOICE',
        fields: [
          {
            type: 'RELATION',
            universalSettings: {
              relationType: 'MANY_TO_ONE',
              onDelete: 'SET_NULL',
            },
          },
        ],
      },
      enumBindings: OBJECT_ENUM_BINDINGS,
    });

    expect(file.startsWith('import {\n  defineObject,\n')).toBe(true);
    expect(file).toContain("} from 'twenty-sdk/define';");
    expect(file).toContain('relationType: RelationType.MANY_TO_ONE,');
    expect(file).toContain('onDelete: OnDeleteAction.SET_NULL,');
  });

  it('should quote a key that is not a valid identifier and escape strings', () => {
    const file = writeDefineFile({
      definer: 'defineApplication',
      config: {
        displayName: "Tim's app",
        translations: { 'fr-FR': { greeting: 'Bonjour' } },
        nothing: null,
        empty: [],
      },
    });

    expect(file).toContain("displayName: 'Tim\\'s app',");
    expect(file).toContain("'fr-FR': {");
    expect(file).toContain('nothing: null,');
    expect(file).toContain('empty: [],');
  });

  it('should end with a single default export of the definer call', () => {
    const file = writeDefineFile({
      definer: 'defineObject',
      config: { nameSingular: 'pet' },
    });

    expect(file).toBe(
      "import { defineObject } from 'twenty-sdk/define';\n" +
        '\n' +
        'export default defineObject({\n' +
        "  nameSingular: 'pet',\n" +
        '});\n',
    );
  });

  it('should write every bound view property as its enum symbol and import each symbol on its own line', () => {
    const file = writeDefineFile({
      definer: 'defineView',
      config: {
        universalIdentifier: 'view-uid',
        name: 'Companies by owner',
        objectUniversalIdentifier: 'object-uid',
        type: 'TABLE_WIDGET',
        visibility: 'WORKSPACE',
        openRecordIn: 'SIDE_PANEL',
        calendarLayout: 'MONTH',
        kanbanAggregateOperation: 'COUNT',
        fields: [
          {
            universalIdentifier: 'view-field-uid',
            fieldMetadataUniversalIdentifier: 'field-uid',
            position: 0,
            aggregateOperation: 'COUNT_UNIQUE_VALUES',
          },
        ],
        filters: [
          {
            universalIdentifier: 'view-filter-uid',
            fieldMetadataUniversalIdentifier: 'field-uid',
            operand: 'CONTAINS',
            value: 'acme',
          },
        ],
        filterGroups: [
          {
            universalIdentifier: 'view-filter-group-uid',
            logicalOperator: 'NOT',
          },
        ],
        sorts: [
          {
            universalIdentifier: 'view-sort-uid',
            fieldMetadataUniversalIdentifier: 'field-uid',
            direction: 'DESC',
          },
        ],
      },
      enumBindings: VIEW_ENUM_BINDINGS,
    });

    expect(
      file.startsWith(
        'import {\n' +
          '  defineView,\n' +
          '  AggregateOperations,\n' +
          '  ViewCalendarLayout,\n' +
          '  ViewFilterGroupLogicalOperator,\n' +
          '  ViewFilterOperand,\n' +
          '  ViewOpenRecordIn,\n' +
          '  ViewSortDirection,\n' +
          '  ViewType,\n' +
          '  ViewVisibility,\n' +
          "} from 'twenty-sdk/define';\n",
      ),
    ).toBe(true);
    expect(file).toContain('type: ViewType.TABLE_WIDGET,');
    expect(file).toContain('visibility: ViewVisibility.WORKSPACE,');
    expect(file).toContain('openRecordIn: ViewOpenRecordIn.SIDE_PANEL,');
    expect(file).toContain('calendarLayout: ViewCalendarLayout.MONTH,');
    expect(file).toContain(
      'kanbanAggregateOperation: AggregateOperations.COUNT,',
    );
    expect(file).toContain(
      'aggregateOperation: AggregateOperations.COUNT_UNIQUE_VALUES,',
    );
    expect(file).toContain('operand: ViewFilterOperand.CONTAINS,');
    expect(file).toContain(
      'logicalOperator: ViewFilterGroupLogicalOperator.NOT,',
    );
    expect(file).toContain('direction: ViewSortDirection.DESC,');
  });

  it('should leave a filter operand that is not a member of ViewFilterOperand as a literal', () => {
    const file = writeDefineFile({
      definer: 'defineView',
      config: {
        universalIdentifier: 'view-uid',
        filters: [
          {
            universalIdentifier: 'view-filter-uid',
            fieldMetadataUniversalIdentifier: 'field-uid',
            operand: 'contains',
            value: 'acme',
          },
        ],
      },
      enumBindings: VIEW_ENUM_BINDINGS,
    });

    expect(file).toContain("operand: 'contains',");
    expect(file).toContain("import { defineView } from 'twenty-sdk/define';");
  });

  it('should not bind an operand that sits on the view itself rather than inside its filters', () => {
    const file = writeDefineFile({
      definer: 'defineView',
      config: {
        universalIdentifier: 'view-uid',
        operand: 'CONTAINS',
      },
      enumBindings: VIEW_ENUM_BINDINGS,
    });

    expect(file).toContain("operand: 'CONTAINS',");
    expect(file).toContain("import { defineView } from 'twenty-sdk/define';");
  });

  it('should write a standalone view field aggregate operation as an AggregateOperations member', () => {
    const file = writeDefineFile({
      definer: 'defineViewField',
      config: {
        universalIdentifier: 'view-field-uid',
        viewUniversalIdentifier: 'view-uid',
        fieldMetadataUniversalIdentifier: 'field-uid',
        position: 0,
        isVisible: true,
        aggregateOperation: 'MIN',
      },
      enumBindings: VIEW_FIELD_ENUM_BINDINGS,
    });

    expect(file).toContain('aggregateOperation: AggregateOperations.MIN,');
    expect(file).toContain(
      "import { defineViewField, AggregateOperations } from 'twenty-sdk/define';",
    );
  });

  it('should write every bound page layout property as its enum symbol and import each symbol on its own line', () => {
    const file = writeDefineFile({
      definer: 'definePageLayout',
      config: {
        universalIdentifier: 'page-layout-uid',
        name: 'Pet dashboard',
        type: 'DASHBOARD',
        tabs: [
          {
            universalIdentifier: 'tab-uid',
            title: 'Charts',
            position: 0,
            layoutMode: 'GRID',
            widgets: [
              {
                universalIdentifier: 'chart-widget-uid',
                title: 'Age by status',
                type: 'GRAPH',
                objectUniversalIdentifier: 'object-uid',
                position: {
                  layoutMode: 'GRID',
                  row: 0,
                  column: 0,
                  rowSpan: 4,
                  columnSpan: 6,
                },
                configuration: {
                  configurationType: 'BAR_CHART',
                  aggregateFieldMetadataUniversalIdentifier: 'age-field-uid',
                  aggregateOperation: 'AVG',
                  primaryAxisGroupByFieldMetadataUniversalIdentifier:
                    'status-field-uid',
                  primaryAxisDateGranularity: 'MONTH',
                  secondaryAxisGroupByFieldMetadataUniversalIdentifier: null,
                  groupMode: 'STACKED',
                },
              },
              {
                universalIdentifier: 'fields-widget-uid',
                title: 'Fields',
                type: 'FIELDS',
                position: { layoutMode: 'VERTICAL_LIST', index: 1 },
                configuration: {
                  configurationType: 'FIELDS',
                  viewUniversalIdentifier: null,
                  fieldDisplayMode: 'CARD',
                },
              },
            ],
          },
        ],
      },
      enumBindings: PAGE_LAYOUT_ENUM_BINDINGS,
    });

    expect(
      file.startsWith(
        'import {\n' +
          '  definePageLayout,\n' +
          '  AggregateOperations,\n' +
          '  ObjectRecordGroupByDateGranularity,\n' +
          '  PageLayoutTabLayoutMode,\n' +
          '  PageLayoutType,\n' +
          '  WidgetType,\n' +
          "} from 'twenty-sdk/define';\n",
      ),
    ).toBe(true);
    expect(file).toContain('type: PageLayoutType.DASHBOARD,');
    expect(file).toContain('layoutMode: PageLayoutTabLayoutMode.GRID,');
    expect(file).toContain('type: WidgetType.GRAPH,');
    expect(file).toContain('type: WidgetType.FIELDS,');
    expect(file).toContain(
      'layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,',
    );
    expect(file).toContain('aggregateOperation: AggregateOperations.AVG,');
    expect(file).toContain(
      'primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,',
    );
    expect(file).toContain("configurationType: 'BAR_CHART',");
    expect(file).toContain("groupMode: 'STACKED',");
    expect(file).toContain("fieldDisplayMode: 'CARD',");
    expect(file).toContain(
      'secondaryAxisGroupByFieldMetadataUniversalIdentifier: null,',
    );
    expect(file).toContain('viewUniversalIdentifier: null,');
  });

  it('should not bind a layout mode that sits on the page layout itself rather than on its tabs', () => {
    const file = writeDefineFile({
      definer: 'definePageLayout',
      config: { universalIdentifier: 'page-layout-uid', layoutMode: 'GRID' },
      enumBindings: PAGE_LAYOUT_ENUM_BINDINGS,
    });

    expect(file).toContain("layoutMode: 'GRID',");
    expect(file).toContain(
      "import { definePageLayout } from 'twenty-sdk/define';",
    );
  });

  it('should write a standalone page layout tab with its widgets under the tab enum bindings', () => {
    const file = writeDefineFile({
      definer: 'definePageLayoutTab',
      config: {
        universalIdentifier: 'tab-uid',
        pageLayoutUniversalIdentifier: 'page-layout-uid',
        title: 'Extra',
        position: 60,
        layoutMode: 'VERTICAL_LIST',
        widgets: [
          {
            universalIdentifier: 'widget-uid',
            title: 'Docs',
            type: 'IFRAME',
            position: { layoutMode: 'VERTICAL_LIST', index: 0 },
            configuration: {
              configurationType: 'IFRAME',
              url: 'https://example.com/docs',
            },
          },
        ],
      },
      enumBindings: PAGE_LAYOUT_TAB_ENUM_BINDINGS,
    });

    expect(file).toBe(
      'import {\n' +
        '  definePageLayoutTab,\n' +
        '  PageLayoutTabLayoutMode,\n' +
        '  WidgetType,\n' +
        "} from 'twenty-sdk/define';\n" +
        '\n' +
        'export default definePageLayoutTab({\n' +
        "  universalIdentifier: 'tab-uid',\n" +
        "  pageLayoutUniversalIdentifier: 'page-layout-uid',\n" +
        "  title: 'Extra',\n" +
        '  position: 60,\n' +
        '  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,\n' +
        '  widgets: [\n' +
        '    {\n' +
        "      universalIdentifier: 'widget-uid',\n" +
        "      title: 'Docs',\n" +
        '      type: WidgetType.IFRAME,\n' +
        '      position: {\n' +
        '        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,\n' +
        '        index: 0,\n' +
        '      },\n' +
        '      configuration: {\n' +
        "        configurationType: 'IFRAME',\n" +
        "        url: 'https://example.com/docs',\n" +
        '      },\n' +
        '    },\n' +
        '  ],\n' +
        '});\n',
    );
  });

  it('should write a nameless object navigation menu item with its type as a NavigationMenuItemType member', () => {
    const file = writeDefineFile({
      definer: 'defineNavigationMenuItem',
      config: {
        universalIdentifier: 'ad199fde-d4f4-4634-a94c-95b52fa32567',
        type: 'OBJECT',
        position: 8,
        targetObjectUniversalIdentifier: '5c5822f2-9efa-4cb7-8101-98f5c25765b9',
      },
      enumBindings: NAVIGATION_MENU_ITEM_ENUM_BINDINGS,
    });

    expect(file).toBe(
      'import {\n' +
        '  defineNavigationMenuItem,\n' +
        '  NavigationMenuItemType,\n' +
        "} from 'twenty-sdk/define';\n" +
        '\n' +
        'export default defineNavigationMenuItem({\n' +
        "  universalIdentifier: 'ad199fde-d4f4-4634-a94c-95b52fa32567',\n" +
        '  type: NavigationMenuItemType.OBJECT,\n' +
        '  position: 8,\n' +
        "  targetObjectUniversalIdentifier: '5c5822f2-9efa-4cb7-8101-98f5c25765b9',\n" +
        '});\n',
    );
  });

  it('should write a folder navigation menu item with its name and icon', () => {
    const file = writeDefineFile({
      definer: 'defineNavigationMenuItem',
      config: {
        universalIdentifier: 'navigation-menu-item-uid',
        type: 'FOLDER',
        position: 2,
        name: 'Operations',
        icon: 'IconFolder',
      },
      enumBindings: NAVIGATION_MENU_ITEM_ENUM_BINDINGS,
    });

    expect(file).toBe(
      'import {\n' +
        '  defineNavigationMenuItem,\n' +
        '  NavigationMenuItemType,\n' +
        "} from 'twenty-sdk/define';\n" +
        '\n' +
        'export default defineNavigationMenuItem({\n' +
        "  universalIdentifier: 'navigation-menu-item-uid',\n" +
        '  type: NavigationMenuItemType.FOLDER,\n' +
        '  position: 2,\n' +
        "  name: 'Operations',\n" +
        "  icon: 'IconFolder',\n" +
        '});\n',
    );
  });
});
