import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { getTabsRenderableForTargetObject } from '@/page-layout/utils/getTabsRenderableForTargetObject';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('getTabsRenderableForTargetObject', () => {
  const createMockWidget = (
    id: string,
    type: WidgetType,
  ): PageLayoutTab['widgets'][0] => ({
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    isActive: true,
    pageLayoutTabId: 'tab-1',
    title: `Widget ${id}`,
    type,
    objectMetadataId: null,
    gridPosition: {
      __typename: 'GridPosition',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    },
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: null,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    conditionalDisplay: null,
  });

  const createMockTab = (
    id: string,
    widgets: PageLayoutTab['widgets'],
  ): PageLayoutTab => ({
    __typename: 'PageLayoutTab',
    applicationId: '',
    id,
    isActive: true,
    pageLayoutId: 'page-layout-1',
    title: `Tab ${id}`,
    position: 0,
    widgets,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
  });

  const createRelationField = (
    name: string,
    isActive = true,
  ): Pick<FieldMetadataItem, 'name' | 'isActive' | 'type'> => ({
    name,
    isActive,
    type: FieldMetadataType.RELATION,
  });

  it('should return tabs unchanged when there is no target object', () => {
    const tabs = [
      createMockTab('tab-1', [createMockWidget('widget-1', WidgetType.TASKS)]),
    ];

    const result = getTabsRenderableForTargetObject({
      tabs,
      targetObjectFields: undefined,
    });

    expect(result).toEqual(tabs);
  });

  it('should keep tabs whose widgets are not relation-scoped', () => {
    const tabs = [
      createMockTab('tab-1', [createMockWidget('widget-1', WidgetType.FIELDS)]),
    ];

    const result = getTabsRenderableForTargetObject({
      tabs,
      targetObjectFields: [],
    });

    expect(result).toHaveLength(1);
  });

  it('should drop tabs reading through a relation the object does not have', () => {
    const tabs = [
      createMockTab('tab-1', [createMockWidget('widget-1', WidgetType.TASKS)]),
      createMockTab('tab-2', [createMockWidget('widget-2', WidgetType.NOTES)]),
      createMockTab('tab-3', [createMockWidget('widget-3', WidgetType.FILES)]),
      createMockTab('tab-4', [
        createMockWidget('widget-4', WidgetType.TIMELINE),
      ]),
    ];

    const result = getTabsRenderableForTargetObject({
      tabs,
      targetObjectFields: [createRelationField('timelineActivities')],
    });

    expect(result.map((tab) => tab.id)).toEqual(['tab-4']);
  });

  it('should drop tabs whose relation field exists but is deactivated', () => {
    const tabs = [
      createMockTab('tab-1', [createMockWidget('widget-1', WidgetType.TASKS)]),
    ];

    const result = getTabsRenderableForTargetObject({
      tabs,
      targetObjectFields: [createRelationField('taskTargets', false)],
    });

    expect(result).toHaveLength(0);
  });

  it('should keep emails and calendar tabs without a participants relation', () => {
    const tabs = [
      createMockTab('tab-1', [createMockWidget('widget-1', WidgetType.EMAILS)]),
      createMockTab('tab-2', [
        createMockWidget('widget-2', WidgetType.CALENDAR),
      ]),
    ];

    const result = getTabsRenderableForTargetObject({
      tabs,
      targetObjectFields: [],
    });

    expect(result).toHaveLength(2);
  });

  it('should drop emails tabs when the participants relation is deactivated', () => {
    const tabs = [
      createMockTab('tab-1', [createMockWidget('widget-1', WidgetType.EMAILS)]),
    ];

    const result = getTabsRenderableForTargetObject({
      tabs,
      targetObjectFields: [createRelationField('messageParticipants', false)],
    });

    expect(result).toHaveLength(0);
  });

  it('should ignore non-relation fields sharing the relation field name', () => {
    const tabs = [
      createMockTab('tab-1', [createMockWidget('widget-1', WidgetType.TASKS)]),
    ];

    const result = getTabsRenderableForTargetObject({
      tabs,
      targetObjectFields: [
        { name: 'taskTargets', isActive: true, type: FieldMetadataType.TEXT },
      ],
    });

    expect(result).toHaveLength(0);
  });
});
