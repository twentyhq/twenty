import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeBuiltInOwnerBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInOwnerBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType, WidgetType } from '~/generated-metadata/graphql';

const buildWidget = ({
  id,
  type,
  objectMetadataId,
}: {
  id: string;
  type: WidgetType;
  objectMetadataId: string | null;
}) =>
  ({
    id,
    type,
    objectMetadataId,
  }) as PageLayoutWidget;

const buildRelationField = ({
  id,
  name,
  relationType,
  targetNameSingular,
  isActive = true,
}: {
  id: string;
  name: string;
  relationType: RelationType;
  targetNameSingular: string;
  isActive?: boolean;
}) =>
  ({
    id,
    name,
    type: FieldMetadataType.RELATION,
    isActive,
    relation: {
      type: relationType,
      targetObjectMetadata: { nameSingular: targetNameSingular },
    },
  }) as FieldMetadataItem;

const buildObject = (id: string, fields: FieldMetadataItem[]) =>
  ({ id, fields }) as Parameters<
    typeof computeBuiltInOwnerBindings
  >[0]['objectMetadataItems'][number];

const PERSON_OBJECT = buildObject('person-object-id', [
  buildRelationField({
    id: 'person-company-id',
    name: 'company',
    relationType: RelationType.MANY_TO_ONE,
    targetNameSingular: 'company',
  }),
  {
    id: 'person-created-at-id',
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    isActive: true,
  } as FieldMetadataItem,
]);

const COMPANY_OBJECT = buildObject('company-object-id', [
  buildRelationField({
    id: 'company-people-id',
    name: 'people',
    relationType: RelationType.ONE_TO_MANY,
    targetNameSingular: 'person',
  }),
  buildRelationField({
    id: 'company-account-owner-id',
    name: 'accountOwner',
    relationType: RelationType.MANY_TO_ONE,
    targetNameSingular: 'workspaceMember',
  }),
]);

const TICKET_OBJECT = buildObject('ticket-object-id', [
  buildRelationField({
    id: 'ticket-reviewer-id',
    name: 'reviewer',
    relationType: RelationType.MANY_TO_ONE,
    targetNameSingular: 'workspaceMember',
  }),
  buildRelationField({
    id: 'ticket-assignee-id',
    name: 'assignee',
    relationType: RelationType.MANY_TO_ONE,
    targetNameSingular: 'workspaceMember',
  }),
]);

const CUSTOM_OBJECT = buildObject('custom-object-id', [
  buildRelationField({
    id: 'custom-reviewer-id',
    name: 'reviewer',
    relationType: RelationType.MANY_TO_ONE,
    targetNameSingular: 'workspaceMember',
  }),
  buildRelationField({
    id: 'custom-approver-id',
    name: 'approver',
    relationType: RelationType.MANY_TO_ONE,
    targetNameSingular: 'workspaceMember',
  }),
]);

const OBJECT_WITH_INACTIVE_OWNER = buildObject('legacy-object-id', [
  buildRelationField({
    id: 'legacy-account-owner-id',
    name: 'accountOwner',
    relationType: RelationType.MANY_TO_ONE,
    targetNameSingular: 'workspaceMember',
    isActive: false,
  }),
]);

const OBJECT_WITH_ONE_TO_MANY_MEMBERS = buildObject('team-object-id', [
  buildRelationField({
    id: 'team-members-id',
    name: 'members',
    relationType: RelationType.ONE_TO_MANY,
    targetNameSingular: 'workspaceMember',
  }),
]);

const OBJECT_METADATA_ITEMS = [
  PERSON_OBJECT,
  COMPANY_OBJECT,
  TICKET_OBJECT,
  CUSTOM_OBJECT,
  OBJECT_WITH_INACTIVE_OWNER,
  OBJECT_WITH_ONE_TO_MANY_MEMBERS,
];

const computeForGraphWidgetOn = (objectMetadataId: string | null) =>
  computeBuiltInOwnerBindings({
    widgets: [
      buildWidget({ id: 'chart-1', type: WidgetType.GRAPH, objectMetadataId }),
    ],
    objectMetadataItems: OBJECT_METADATA_ITEMS,
  });

describe('computeBuiltInOwnerBindings', () => {
  it('binds null when the object has no relation to workspace members', () => {
    expect(computeForGraphWidgetOn(PERSON_OBJECT.id)).toEqual({
      'chart-1': null,
    });
  });

  it('binds the single many-to-one workspace member relation', () => {
    expect(computeForGraphWidgetOn(COMPANY_OBJECT.id)).toEqual({
      'chart-1': { fieldMetadataId: 'company-account-owner-id' },
    });
  });

  it('prefers a conventional owner field name when several relations match', () => {
    expect(computeForGraphWidgetOn(TICKET_OBJECT.id)).toEqual({
      'chart-1': { fieldMetadataId: 'ticket-assignee-id' },
    });
  });

  it('falls back to the first matching field by name when none is conventional', () => {
    expect(computeForGraphWidgetOn(CUSTOM_OBJECT.id)).toEqual({
      'chart-1': { fieldMetadataId: 'custom-approver-id' },
    });
  });

  it('ignores inactive owner fields', () => {
    expect(computeForGraphWidgetOn(OBJECT_WITH_INACTIVE_OWNER.id)).toEqual({
      'chart-1': null,
    });
  });

  it('ignores one-to-many relations to workspace members', () => {
    expect(computeForGraphWidgetOn(OBJECT_WITH_ONE_TO_MANY_MEMBERS.id)).toEqual(
      { 'chart-1': null },
    );
  });

  it('binds null when the widget has no object or the object is unknown', () => {
    expect(computeForGraphWidgetOn(null)).toEqual({ 'chart-1': null });
    expect(computeForGraphWidgetOn('unknown-object-id')).toEqual({
      'chart-1': null,
    });
  });

  it('ignores widgets that are not graphs', () => {
    const bindings = computeBuiltInOwnerBindings({
      widgets: [
        buildWidget({
          id: 'table-1',
          type: WidgetType.RECORD_TABLE,
          objectMetadataId: COMPANY_OBJECT.id,
        }),
      ],
      objectMetadataItems: OBJECT_METADATA_ITEMS,
    });

    expect(bindings).toEqual({});
  });
});
