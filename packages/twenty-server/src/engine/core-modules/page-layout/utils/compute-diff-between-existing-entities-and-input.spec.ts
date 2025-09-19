import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';

import { computeDiffBetweenExistingEntitiesAndInput } from './compute-diff-between-existing-entities-and-input';

describe('computeDiffBetweenExistingEntitiesAndInput', () => {
  describe('with page layout tabs', () => {
    type PageLayoutTabEntity = {
      id: string;
      title: string;
      position: number;
      pageLayoutId: string;
      createdAt: Date;
      updatedAt: Date;
    };

    type PageLayoutTabInput = {
      id: string;
      title: string;
      position: number;
      widgets: Array<{ id: string; title: string }>;
    };

    const existingTabs: PageLayoutTabEntity[] = [
      {
        id: 'tab-1',
        title: 'Overview',
        position: 0,
        pageLayoutId: 'layout-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 'tab-2',
        title: 'Details',
        position: 1,
        pageLayoutId: 'layout-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];

    it('should identify tabs to create when new tabs are provided', () => {
      const inputTabs: PageLayoutTabInput[] = [
        {
          id: 'tab-1',
          title: 'Overview',
          position: 0,
          widgets: [],
        },
        {
          id: 'tab-2',
          title: 'Details',
          position: 1,
          widgets: [],
        },
        {
          id: 'tab-3',
          title: 'Activities',
          position: 2,
          widgets: [],
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingTabs,
        inputTabs,
        ['title', 'position'],
      );

      expect(result.entitiesToCreate).toHaveLength(1);
      expect(result.entitiesToCreate[0]).toEqual({
        id: 'tab-3',
        title: 'Activities',
        position: 2,
        widgets: [],
      });
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should identify tabs to update when existing tabs are modified', () => {
      const inputTabs: PageLayoutTabInput[] = [
        {
          id: 'tab-1',
          title: 'Summary',
          position: 0,
          widgets: [],
        },
        {
          id: 'tab-2',
          title: 'Details',
          position: 2,
          widgets: [],
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingTabs,
        inputTabs,
        ['title', 'position'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(2);
      expect(result.entitiesToUpdate).toContainEqual({
        id: 'tab-1',
        title: 'Summary',
        position: 0,
        widgets: [],
      });
      expect(result.entitiesToUpdate).toContainEqual({
        id: 'tab-2',
        title: 'Details',
        position: 2,
        widgets: [],
      });
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should identify tabs to delete when tabs are removed from input', () => {
      const inputTabs: PageLayoutTabInput[] = [
        {
          id: 'tab-1',
          title: 'Overview',
          position: 0,
          widgets: [],
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingTabs,
        inputTabs,
        ['title', 'position'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(1);
      expect(result.idsToDelete).toContain('tab-2');
    });

    it('should handle mixed operations (create, update, delete)', () => {
      const inputTabs: PageLayoutTabInput[] = [
        {
          id: 'tab-1',
          title: 'Overview Updated',
          position: 0,
          widgets: [],
        },
        {
          id: 'tab-3',
          title: 'New Tab',
          position: 2,
          widgets: [],
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingTabs,
        inputTabs,
        ['title', 'position'],
      );

      expect(result.entitiesToCreate).toHaveLength(1);
      expect(result.entitiesToCreate[0].id).toBe('tab-3');
      expect(result.entitiesToUpdate).toHaveLength(1);
      expect(result.entitiesToUpdate[0].id).toBe('tab-1');
      expect(result.idsToDelete).toHaveLength(1);
      expect(result.idsToDelete).toContain('tab-2');
    });

    it('should only compare specified properties for updates', () => {
      const inputTabs: PageLayoutTabInput[] = [
        {
          id: 'tab-1',
          title: 'Overview',
          position: 0,
          widgets: [],
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        [existingTabs[0]],
        inputTabs,
        ['title', 'position'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should not update when comparing identical structure entities', () => {
      const identicalTabs: PageLayoutTabEntity[] = [
        {
          id: 'tab-1',
          title: 'Overview',
          position: 0,
          pageLayoutId: 'layout-1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        identicalTabs,
        [identicalTabs[0]],
        ['title', 'position'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });
  });

  describe('with page layout widgets', () => {
    type PageLayoutWidgetEntity = {
      id: string;
      pageLayoutTabId: string;
      title: string;
      type: WidgetType;
      objectMetadataId: string | null;
      gridPosition: {
        row: number;
        column: number;
        rowSpan: number;
        columnSpan: number;
      };
      configuration: Record<string, unknown> | null;
      createdAt: Date;
      updatedAt: Date;
    };

    type PageLayoutWidgetInput = {
      id: string;
      title: string;
      type: WidgetType;
      gridPosition: {
        row: number;
        column: number;
        rowSpan: number;
        columnSpan: number;
      };
      configuration: Record<string, unknown> | null;
    };

    const existingWidgets: PageLayoutWidgetEntity[] = [
      {
        id: 'widget-1',
        pageLayoutTabId: 'tab-1',
        title: 'Contact Details',
        type: WidgetType.FIELDS,
        objectMetadataId: 'person-metadata-id',
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 2,
        },
        configuration: { fields: ['name', 'email'] },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 'widget-2',
        pageLayoutTabId: 'tab-1',
        title: 'Contact Graph',
        type: WidgetType.GRAPH,
        objectMetadataId: 'person-metadata-id',
        gridPosition: {
          row: 1,
          column: 0,
          rowSpan: 2,
          columnSpan: 2,
        },
        configuration: { chartType: 'bar' },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];

    it('should identify widgets to create when new widgets are provided', () => {
      const inputWidgets: PageLayoutWidgetInput[] = [
        {
          id: 'widget-1',
          title: 'Contact Details',
          type: WidgetType.FIELDS,
          gridPosition: {
            row: 0,
            column: 0,
            rowSpan: 1,
            columnSpan: 2,
          },
          configuration: { fields: ['name', 'email'] },
        },
        {
          id: 'widget-2',
          title: 'Contact Graph',
          type: WidgetType.GRAPH,
          gridPosition: {
            row: 1,
            column: 0,
            rowSpan: 2,
            columnSpan: 2,
          },
          configuration: { chartType: 'bar' },
        },
        {
          id: 'widget-3',
          title: 'External Tool',
          type: WidgetType.IFRAME,
          gridPosition: {
            row: 0,
            column: 2,
            rowSpan: 1,
            columnSpan: 1,
          },
          configuration: { url: 'https://example.com' },
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingWidgets,
        inputWidgets,
        ['title', 'type', 'gridPosition', 'configuration'],
      );

      expect(result.entitiesToCreate).toHaveLength(1);
      expect(result.entitiesToCreate[0]).toEqual({
        id: 'widget-3',
        title: 'External Tool',
        type: WidgetType.IFRAME,
        gridPosition: {
          row: 0,
          column: 2,
          rowSpan: 1,
          columnSpan: 1,
        },
        configuration: { url: 'https://example.com' },
      });
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should identify widgets to update when configuration changes', () => {
      const inputWidgets: PageLayoutWidgetInput[] = [
        {
          id: 'widget-1',
          title: 'Contact Details',
          type: WidgetType.FIELDS,
          gridPosition: {
            row: 0,
            column: 0,
            rowSpan: 1,
            columnSpan: 2,
          },
          configuration: { fields: ['name', 'email', 'phone'] },
        },
        {
          id: 'widget-2',
          title: 'Contact Graph',
          type: WidgetType.GRAPH,
          gridPosition: {
            row: 1,
            column: 0,
            rowSpan: 1,
            columnSpan: 2,
          },
          configuration: { chartType: 'bar' },
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingWidgets,
        inputWidgets,
        ['title', 'type', 'gridPosition', 'configuration'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(2);
      expect(result.entitiesToUpdate[0].id).toBe('widget-1');
      expect(result.entitiesToUpdate[1].id).toBe('widget-2');
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should identify widgets to delete when widgets are removed', () => {
      const inputWidgets: PageLayoutWidgetInput[] = [
        {
          id: 'widget-1',
          title: 'Contact Details',
          type: WidgetType.FIELDS,
          gridPosition: {
            row: 0,
            column: 0,
            rowSpan: 1,
            columnSpan: 2,
          },
          configuration: { fields: ['name', 'email'] },
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingWidgets,
        inputWidgets,
        ['title', 'type', 'gridPosition', 'configuration'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(1);
      expect(result.idsToDelete).toContain('widget-2');
    });

    it('should handle complex nested object comparisons', () => {
      const inputWidgets: PageLayoutWidgetInput[] = [
        {
          id: 'widget-1',
          title: 'Contact Details',
          type: WidgetType.FIELDS,
          gridPosition: {
            row: 1,
            column: 0,
            rowSpan: 1,
            columnSpan: 2,
          },
          configuration: { fields: ['name', 'email'] },
        },
        {
          id: 'widget-2',
          title: 'Contact Graph',
          type: WidgetType.GRAPH,
          gridPosition: {
            row: 1,
            column: 0,
            rowSpan: 2,
            columnSpan: 2,
          },
          configuration: { chartType: 'bar' },
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingWidgets,
        inputWidgets,
        ['gridPosition'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(1);
      expect(result.entitiesToUpdate[0].id).toBe('widget-1');
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should handle null values in configuration', () => {
      const inputWidgets: PageLayoutWidgetInput[] = [
        {
          id: 'widget-1',
          title: 'Contact Details',
          type: WidgetType.FIELDS,
          gridPosition: {
            row: 0,
            column: 0,
            rowSpan: 1,
            columnSpan: 2,
          },
          configuration: null,
        },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        [existingWidgets[0]],
        inputWidgets,
        ['configuration'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(1);
      expect(result.entitiesToUpdate[0].configuration).toBeNull();
      expect(result.idsToDelete).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    type SimpleEntity = {
      id: string;
      name: string;
    };

    it('should handle empty existing entities array', () => {
      const inputEntities: SimpleEntity[] = [{ id: '1', name: 'New Entity' }];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        [],
        inputEntities,
        ['name'],
      );

      expect(result.entitiesToCreate).toHaveLength(1);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should handle empty input entities array', () => {
      const existingEntities: SimpleEntity[] = [
        { id: '1', name: 'Existing Entity' },
      ];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingEntities,
        [],
        ['name'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(1);
      expect(result.idsToDelete).toContain('1');
    });

    it('should handle both arrays being empty', () => {
      const result = computeDiffBetweenExistingEntitiesAndInput(
        [],
        [],
        ['name'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should handle entities with identical content and structure', () => {
      const entities: SimpleEntity[] = [{ id: '1', name: 'Same Entity' }];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        entities,
        entities,
        ['name'],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });

    it('should handle empty properties to compare array', () => {
      const existingEntities: SimpleEntity[] = [{ id: '1', name: 'Existing' }];
      const inputEntities: SimpleEntity[] = [{ id: '1', name: 'Changed' }];

      const result = computeDiffBetweenExistingEntitiesAndInput(
        existingEntities,
        inputEntities,
        [],
      );

      expect(result.entitiesToCreate).toHaveLength(0);
      expect(result.entitiesToUpdate).toHaveLength(0);
      expect(result.idsToDelete).toHaveLength(0);
    });
  });
});
