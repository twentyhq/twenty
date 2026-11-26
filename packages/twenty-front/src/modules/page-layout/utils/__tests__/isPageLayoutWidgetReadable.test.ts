import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { isPageLayoutWidgetReadable } from '@/page-layout/utils/isPageLayoutWidgetReadable';
import {
  FieldDisplayMode,
  RelationType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const COMPANY_ID = 'company-id';
const TASK_ID = 'task-id';
const OPPORTUNITY_ID = 'opportunity-id';

const OPPORTUNITIES_FIELD_ID = 'company-opportunities-field-id';
const COMPANY_NAME_FIELD_ID = 'company-name-field-id';

const OBJECT_METADATA_ITEMS = [
  {
    id: COMPANY_ID,
    nameSingular: 'company',
    fields: [
      { id: COMPANY_NAME_FIELD_ID, relation: null },
      {
        id: OPPORTUNITIES_FIELD_ID,
        relation: {
          type: RelationType.ONE_TO_MANY,
          sourceFieldMetadata: {
            id: OPPORTUNITIES_FIELD_ID,
            name: 'opportunities',
          },
          targetFieldMetadata: {
            id: 'opportunity-company-field-id',
            name: 'company',
          },
          sourceObjectMetadata: {
            id: COMPANY_ID,
            nameSingular: 'company',
            namePlural: 'companies',
          },
          targetObjectMetadata: {
            id: OPPORTUNITY_ID,
            nameSingular: 'opportunity',
            namePlural: 'opportunities',
          },
        },
      },
    ],
  },
  { id: TASK_ID, nameSingular: 'task', fields: [] },
  { id: OPPORTUNITY_ID, nameSingular: 'opportunity', fields: [] },
];

const buildFieldConfiguration = (
  fieldMetadataId: string,
): FieldConfiguration => ({
  __typename: 'FieldConfiguration',
  configurationType: WidgetConfigurationType.FIELD,
  fieldMetadataId,
  fieldDisplayMode: FieldDisplayMode.FIELD,
});

const buildObjectPermissions = (
  canReadAllRecords: boolean,
): ObjectRecordsPermissions => ({
  canCreateAllRecords: false,
  canReadAllRecords,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
});

const isReadable = ({
  type,
  objectMetadataId,
  configuration = null,
  unreadableObjectMetadataIds,
}: {
  type: WidgetType;
  objectMetadataId?: string | null;
  configuration?: FieldConfiguration | null;
  unreadableObjectMetadataIds: string[];
}) =>
  isPageLayoutWidgetReadable({
    widget: { type, objectMetadataId, configuration },
    objectMetadataItems: OBJECT_METADATA_ITEMS,
    objectPermissionsByObjectMetadataId: Object.fromEntries(
      OBJECT_METADATA_ITEMS.map(({ id }) => [
        id,
        buildObjectPermissions(!unreadableObjectMetadataIds.includes(id)),
      ]),
    ),
  });

describe('isPageLayoutWidgetReadable', () => {
  it('keeps a widget with no object to read', () => {
    expect(
      isReadable({
        type: WidgetType.IFRAME,
        objectMetadataId: null,
        unreadableObjectMetadataIds: [COMPANY_ID, TASK_ID, OPPORTUNITY_ID],
      }),
    ).toBe(true);
  });

  it('hides a widget bound to an object the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.RECORD_TABLE,
        objectMetadataId: OPPORTUNITY_ID,
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(false);
  });

  it('keeps a widget bound to a readable object', () => {
    expect(
      isReadable({
        type: WidgetType.RECORD_TABLE,
        objectMetadataId: OPPORTUNITY_ID,
        unreadableObjectMetadataIds: [TASK_ID],
      }),
    ).toBe(true);
  });

  it('hides a built-in widget whose data object the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.TASKS,
        objectMetadataId: COMPANY_ID,
        unreadableObjectMetadataIds: [TASK_ID],
      }),
    ).toBe(false);
  });

  it('keeps a built-in widget when both the page object and its data object are readable', () => {
    expect(
      isReadable({
        type: WidgetType.TASKS,
        objectMetadataId: COMPANY_ID,
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(true);
  });

  it('keeps a built-in widget whose data object is not in the workspace', () => {
    expect(
      isReadable({
        type: WidgetType.CALENDAR,
        objectMetadataId: COMPANY_ID,
        unreadableObjectMetadataIds: [],
      }),
    ).toBe(true);
  });

  it('hides a related records field whose target object the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        objectMetadataId: COMPANY_ID,
        configuration: buildFieldConfiguration(OPPORTUNITIES_FIELD_ID),
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(false);
  });

  it('keeps a non-relation field widget on a readable record', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        objectMetadataId: COMPANY_ID,
        configuration: buildFieldConfiguration(COMPANY_NAME_FIELD_ID),
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(true);
  });
});
