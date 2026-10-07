import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
import { computeBuiltInOwnerBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInOwnerBindings';
import {
  FieldMetadataType,
  RelationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const buildWorkspaceMemberRelationField = ({
  id,
  name,
  isActive = true,
  relationType = RelationType.MANY_TO_ONE,
}: {
  id: string;
  name: string;
  isActive?: boolean;
  relationType?: RelationType;
}) => ({
  id,
  name,
  type: FieldMetadataType.RELATION,
  isActive,
  relation: {
    type: relationType,
    targetObjectMetadata: { nameSingular: 'workspaceMember' },
  },
});

const COMPANY_RELATION_FIELD = {
  id: 'company-field-id',
  name: 'company',
  type: FieldMetadataType.RELATION,
  isActive: true,
  relation: {
    type: RelationType.MANY_TO_ONE,
    targetObjectMetadata: { nameSingular: 'company' },
  },
};

const NAME_FIELD = {
  id: 'name-field-id',
  name: 'name',
  type: FieldMetadataType.TEXT,
  isActive: true,
  relation: null,
};

const COMPANY_OBJECT = {
  id: 'company-object-id',
  fields: [
    NAME_FIELD,
    buildWorkspaceMemberRelationField({
      id: 'account-owner-field-id',
      name: 'accountOwner',
    }),
  ],
};

const TASK_OBJECT = {
  id: 'task-object-id',
  fields: [
    buildWorkspaceMemberRelationField({
      id: 'reviewer-field-id',
      name: 'reviewer',
    }),
    buildWorkspaceMemberRelationField({
      id: 'assignee-field-id',
      name: 'assignee',
    }),
  ],
};

const OPPORTUNITY_OBJECT = {
  id: 'opportunity-object-id',
  fields: [
    buildWorkspaceMemberRelationField({
      id: 'approver-field-id',
      name: 'approver',
    }),
    buildWorkspaceMemberRelationField({
      id: 'owner-field-id',
      name: 'owner',
    }),
  ],
};

const OBJECT_WITH_TWO_CUSTOM_OWNER_FIELDS = {
  id: 'two-custom-owner-fields-object-id',
  fields: [
    buildWorkspaceMemberRelationField({
      id: 'sponsor-field-id',
      name: 'sponsor',
    }),
    buildWorkspaceMemberRelationField({
      id: 'manager-field-id',
      name: 'manager',
    }),
  ],
};

const OBJECT_WITHOUT_OWNER_FIELD = {
  id: 'no-owner-object-id',
  fields: [NAME_FIELD, COMPANY_RELATION_FIELD],
};

const OBJECT_WITH_INACTIVE_OWNER_FIELD = {
  id: 'inactive-owner-object-id',
  fields: [
    buildWorkspaceMemberRelationField({
      id: 'inactive-owner-field-id',
      name: 'accountOwner',
      isActive: false,
    }),
  ],
};

const OBJECT_WITH_ONE_TO_MANY_WORKSPACE_MEMBER_FIELD = {
  id: 'one-to-many-object-id',
  fields: [
    buildWorkspaceMemberRelationField({
      id: 'members-field-id',
      name: 'members',
      relationType: RelationType.ONE_TO_MANY,
    }),
  ],
};

const OBJECT_METADATA_ITEMS = [
  COMPANY_OBJECT,
  TASK_OBJECT,
  OPPORTUNITY_OBJECT,
  OBJECT_WITH_TWO_CUSTOM_OWNER_FIELDS,
  OBJECT_WITHOUT_OWNER_FIELD,
  OBJECT_WITH_INACTIVE_OWNER_FIELD,
  OBJECT_WITH_ONE_TO_MANY_WORKSPACE_MEMBER_FIELD,
];

const buildGraphWidget = (id: string, objectMetadataId: string | null) => ({
  id,
  type: WidgetType.GRAPH,
  objectMetadataId,
});

describe('computeBuiltInOwnerBindings', () => {
  it('binds the owner slot to the single workspace member relation of an object', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [buildGraphWidget('company-widget', COMPANY_OBJECT.id)],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({
      'company-widget': {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'account-owner-field-id',
        },
      },
    });
  });

  it('prefers assignee over another workspace member relation declared before it', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [buildGraphWidget('task-widget', TASK_OBJECT.id)],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({
      'task-widget': {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'assignee-field-id',
        },
      },
    });
  });

  it('prefers owner over a custom member relation that sorts before it', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [buildGraphWidget('opportunity-widget', OPPORTUNITY_OBJECT.id)],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({
      'opportunity-widget': {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'owner-field-id',
        },
      },
    });
  });

  it('falls back to the alphabetically first field when two custom owner fields exist', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [
        buildGraphWidget(
          'two-owners-widget',
          OBJECT_WITH_TWO_CUSTOM_OWNER_FIELDS.id,
        ),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({
      'two-owners-widget': {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: 'manager-field-id',
        },
      },
    });
  });

  it('gives no entry to a widget whose object has no workspace member relation', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [
        buildGraphWidget('no-owner-widget', OBJECT_WITHOUT_OWNER_FIELD.id),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });

  it('skips an inactive owner field', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [
        buildGraphWidget(
          'inactive-owner-widget',
          OBJECT_WITH_INACTIVE_OWNER_FIELD.id,
        ),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });

  it('skips a one-to-many relation to workspace members', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [
        buildGraphWidget(
          'one-to-many-widget',
          OBJECT_WITH_ONE_TO_MANY_WORKSPACE_MEMBER_FIELD.id,
        ),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });

  it('ignores non-graph widgets, widgets without an object and unknown objects', () => {
    const bindingsByWidgetId = computeBuiltInOwnerBindings({
      widgets: [
        {
          id: 'record-table-widget',
          type: WidgetType.RECORD_TABLE,
          objectMetadataId: COMPANY_OBJECT.id,
        },
        buildGraphWidget('graph-widget-without-object', null),
        buildGraphWidget('orphan-widget', 'deleted-object-id'),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindingsByWidgetId).toEqual({});
  });
});
