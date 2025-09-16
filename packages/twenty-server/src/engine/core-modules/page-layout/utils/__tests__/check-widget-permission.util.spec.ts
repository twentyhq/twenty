import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import {
  checkWidgetPermission,
  checkWidgetsPermissions,
} from 'src/engine/core-modules/page-layout/utils/check-widget-permission.util';

const createMockWidget = (
  overrides: Partial<PageLayoutWidgetDTO>,
): PageLayoutWidgetDTO => ({
  id: 'widget-1',
  pageLayoutTabId: 'tab-1',
  title: 'Test Widget',
  type: WidgetType.GRAPH,
  objectMetadataId: null,
  gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  configuration: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('checkWidgetPermission', () => {
  const mockWidget = createMockWidget({
    id: 'widget-1',
    type: WidgetType.GRAPH,
    objectMetadataId: 'object-1',
    configuration: { key: 'value' },
  });

  const mockPermissions: ObjectsPermissions = {
    'object-1': {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
      restrictedFields: {},
    },
    'object-2': {
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {},
    },
  };

  describe('when widget has no objectMetadataId', () => {
    it('should grant access by default', () => {
      const widgetWithoutObjectId = createMockWidget({
        id: 'widget-2',
        type: WidgetType.IFRAME,
        objectMetadataId: null,
        configuration: { url: 'https://example.com' },
      });

      const result = checkWidgetPermission(
        widgetWithoutObjectId,
        mockPermissions,
      );

      expect(result.canReadWidget).toBe(true);
      expect(result.configuration).toEqual({ url: 'https://example.com' });
    });
  });

  describe('when user has read permission', () => {
    it('should grant access and preserve configuration', () => {
      const result = checkWidgetPermission(mockWidget, mockPermissions);

      expect(result.canReadWidget).toBe(true);
      expect(result.configuration).toEqual({ key: 'value' });
      expect(result.id).toBe('widget-1');
      expect(result.type).toBe('GRAPH');
    });
  });

  describe('when user lacks read permission', () => {
    it('should deny access and remove configuration', () => {
      const widgetWithNoAccess = {
        ...mockWidget,
        objectMetadataId: 'object-2',
      };

      const result = checkWidgetPermission(widgetWithNoAccess, mockPermissions);

      expect(result.canReadWidget).toBe(false);
      expect(result.configuration).toBe(null);
      expect(result.id).toBe('widget-1');
      expect(result.type).toBe('GRAPH');
    });
  });

  describe('when object permission is not found', () => {
    it('should deny access by default', () => {
      const widgetWithUnknownObject = {
        ...mockWidget,
        objectMetadataId: 'object-unknown',
      };

      const result = checkWidgetPermission(
        widgetWithUnknownObject,
        mockPermissions,
      );

      expect(result.canReadWidget).toBe(false);
      expect(result.configuration).toBe(null);
    });
  });

  describe('when permissions object is empty', () => {
    it('should deny access for widgets with objectMetadataId', () => {
      const result = checkWidgetPermission(mockWidget, {});

      expect(result.canReadWidget).toBe(false);
      expect(result.configuration).toBe(null);
    });
  });
});

describe('checkWidgetsPermissions', () => {
  const mockWidgets = [
    createMockWidget({
      id: 'widget-1',
      type: WidgetType.GRAPH,
      objectMetadataId: 'object-1',
      configuration: { key1: 'value1' },
    }),
    createMockWidget({
      id: 'widget-2',
      type: WidgetType.IFRAME,
      objectMetadataId: 'object-2',
      configuration: { key2: 'value2' },
    }),
    createMockWidget({
      id: 'widget-3',
      type: WidgetType.GRAPH,
      objectMetadataId: null,
      configuration: { key3: 'value3' },
    }),
  ];

  const mockPermissions: ObjectsPermissions = {
    'object-1': {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
      restrictedFields: {},
    },
    'object-2': {
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {},
    },
  };

  it('should check permissions for multiple widgets', () => {
    const results = checkWidgetsPermissions(mockWidgets, mockPermissions);

    expect(results).toHaveLength(3);

    expect(results[0].canReadWidget).toBe(true);
    expect(results[0].configuration).toEqual({ key1: 'value1' });

    expect(results[1].canReadWidget).toBe(false);
    expect(results[1].configuration).toBe(null);

    expect(results[2].canReadWidget).toBe(true);
    expect(results[2].configuration).toEqual({ key3: 'value3' });
  });

  it('should handle empty widget array', () => {
    const results = checkWidgetsPermissions([], mockPermissions);

    expect(results).toEqual([]);
  });

  it('should handle all widgets without objectMetadataId', () => {
    const widgetsWithoutObjectIds = [
      createMockWidget({
        id: '1',
        objectMetadataId: null,
        configuration: { a: 1 },
      }),
      createMockWidget({
        id: '2',
        objectMetadataId: null,
        configuration: { b: 2 },
      }),
    ];

    const results = checkWidgetsPermissions(
      widgetsWithoutObjectIds,
      mockPermissions,
    );

    expect(results.every((r) => r.canReadWidget)).toBe(true);
    expect(results[0].configuration).toEqual({ a: 1 });
    expect(results[1].configuration).toEqual({ b: 2 });
  });
});
