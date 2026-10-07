import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { computeBuiltInDateBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInDateBindings';
import { WidgetType } from '~/generated-metadata/graphql';

const COMPANY_OBJECT = {
  id: 'company-object-id',
  fields: [
    { id: 'company-name-field-id', name: 'name', isActive: true },
    { id: 'company-created-at-field-id', name: 'createdAt', isActive: true },
  ],
};

const PERSON_OBJECT = {
  id: 'person-object-id',
  fields: [
    { id: 'person-created-at-field-id', name: 'createdAt', isActive: true },
  ],
};

const OBJECT_WITHOUT_CREATED_AT = {
  id: 'no-created-at-object-id',
  fields: [{ id: 'some-field-id', name: 'name', isActive: true }],
};

const OBJECT_WITH_INACTIVE_CREATED_AT = {
  id: 'inactive-created-at-object-id',
  fields: [
    { id: 'inactive-created-at-field-id', name: 'createdAt', isActive: false },
  ],
};

const OBJECT_METADATA_ITEMS = [
  COMPANY_OBJECT,
  PERSON_OBJECT,
  OBJECT_WITHOUT_CREATED_AT,
  OBJECT_WITH_INACTIVE_CREATED_AT,
];

describe('computeBuiltInDateBindings', () => {
  it('binds the date slot to createdAt of each graph widget object', () => {
    const bindingsByWidgetId = computeBuiltInDateBindings({
      widgets: [
        {
          id: 'company-widget',
          type: WidgetType.GRAPH,
          objectMetadataId: COMPANY_OBJECT.id,
        },
        {
          id: 'person-widget',
          type: WidgetType.GRAPH,
          objectMetadataId: PERSON_OBJECT.id,
        },
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({
      'company-widget': {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'company-created-at-field-id',
        },
      },
      'person-widget': {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'person-created-at-field-id',
        },
      },
    });
  });

  it('gives no entry to a widget whose object has no createdAt field', () => {
    const bindingsByWidgetId = computeBuiltInDateBindings({
      widgets: [
        {
          id: 'widget-without-created-at',
          type: WidgetType.GRAPH,
          objectMetadataId: OBJECT_WITHOUT_CREATED_AT.id,
        },
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });

  it('gives no entry to a widget whose createdAt field is inactive', () => {
    const bindingsByWidgetId = computeBuiltInDateBindings({
      widgets: [
        {
          id: 'widget-with-inactive-created-at',
          type: WidgetType.GRAPH,
          objectMetadataId: OBJECT_WITH_INACTIVE_CREATED_AT.id,
        },
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });

  it('ignores non-graph widgets and widgets without an object', () => {
    const bindingsByWidgetId = computeBuiltInDateBindings({
      widgets: [
        {
          id: 'record-table-widget',
          type: WidgetType.RECORD_TABLE,
          objectMetadataId: COMPANY_OBJECT.id,
        },
        {
          id: 'graph-widget-without-object',
          type: WidgetType.GRAPH,
          objectMetadataId: null,
        },
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });

  it('gives no entry to a widget whose object is unknown', () => {
    const bindingsByWidgetId = computeBuiltInDateBindings({
      widgets: [
        {
          id: 'orphan-widget',
          type: WidgetType.GRAPH,
          objectMetadataId: 'deleted-object-id',
        },
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });
});
