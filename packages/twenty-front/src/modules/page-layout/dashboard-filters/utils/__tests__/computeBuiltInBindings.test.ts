import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
import { computeBuiltInBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInBindings';
import {
  FieldMetadataType,
  RelationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const buildCreatedAtField = (id: string) => ({
  id,
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
  isActive: true,
  relation: null,
});

const buildAccountOwnerField = (id: string) => ({
  id,
  name: 'accountOwner',
  type: FieldMetadataType.RELATION,
  isActive: true,
  relation: {
    type: RelationType.MANY_TO_ONE,
    targetObjectMetadata: { nameSingular: 'workspaceMember' },
  },
});

const OBJECT_WITH_BOTH = {
  id: 'both-object-id',
  fields: [
    buildCreatedAtField('both-created-at-id'),
    buildAccountOwnerField('both-account-owner-id'),
  ],
};

const OBJECT_WITH_DATE_ONLY = {
  id: 'date-only-object-id',
  fields: [buildCreatedAtField('date-only-created-at-id')],
};

const OBJECT_WITH_OWNER_ONLY = {
  id: 'owner-only-object-id',
  fields: [buildAccountOwnerField('owner-only-account-owner-id')],
};

const OBJECT_WITH_NEITHER = {
  id: 'neither-object-id',
  fields: [],
};

const OBJECT_METADATA_ITEMS = [
  OBJECT_WITH_BOTH,
  OBJECT_WITH_DATE_ONLY,
  OBJECT_WITH_OWNER_ONLY,
  OBJECT_WITH_NEITHER,
];

const buildGraphWidget = (id: string, objectMetadataId: string) => ({
  id,
  type: WidgetType.GRAPH,
  objectMetadataId,
});

describe('computeBuiltInBindings', () => {
  it('merges the date and owner bindings per widget and omits widgets with neither', () => {
    const bindingsByWidgetId = computeBuiltInBindings({
      widgets: [
        buildGraphWidget('both-widget', OBJECT_WITH_BOTH.id),
        buildGraphWidget('date-only-widget', OBJECT_WITH_DATE_ONLY.id),
        buildGraphWidget('owner-only-widget', OBJECT_WITH_OWNER_ONLY.id),
        buildGraphWidget('neither-widget', OBJECT_WITH_NEITHER.id),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({
      'both-widget': {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'both-created-at-id',
        },
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'both-account-owner-id',
        },
      },
      'date-only-widget': {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'date-only-created-at-id',
        },
      },
      'owner-only-widget': {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'owner-only-account-owner-id',
        },
      },
    });
  });

  it('returns an empty record when there are no graph widgets', () => {
    const bindingsByWidgetId = computeBuiltInBindings({
      widgets: [
        {
          id: 'iframe-widget',
          type: WidgetType.IFRAME,
          objectMetadataId: OBJECT_WITH_BOTH.id,
        },
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });
});
