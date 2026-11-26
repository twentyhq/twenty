import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { isPageLayoutWidgetReadable } from '@/page-layout/utils/isPageLayoutWidgetReadable';
import {
  FieldDisplayMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const OBJECT_METADATA_ITEMS = getTestEnrichedObjectMetadataItemsMock();

const COMPANY_ID = getMockObjectMetadataItemOrThrow('company').id;
const PERSON_ID = getMockObjectMetadataItemOrThrow('person').id;
const OPPORTUNITY_ID = getMockObjectMetadataItemOrThrow('opportunity').id;
const TASK_ID = getMockObjectMetadataItemOrThrow('task').id;
const EMPLOYMENT_HISTORY_ID =
  getMockObjectMetadataItemOrThrow('employmentHistory').id;

const getFieldId = (objectNameSingular: string, fieldName: string) => {
  const field = getMockObjectMetadataItemOrThrow(
    objectNameSingular,
  ).fields.find(({ name }) => name === fieldName);

  if (!isDefined(field)) {
    throw new Error(`Missing ${objectNameSingular}.${fieldName} mock field`);
  }

  return field.id;
};

const JUNCTION_VIEW_ID = 'employment-history-view-id';
const COMPANY_VIEW_ID = 'company-view-id';

const VIEWS_BY_ID_MAP = new Map([
  [JUNCTION_VIEW_ID, { objectMetadataId: EMPLOYMENT_HISTORY_ID }],
  [COMPANY_VIEW_ID, { objectMetadataId: COMPANY_ID }],
]);

const buildFieldConfiguration = ({
  fieldMetadataId,
  nestedRelationFieldMetadataId,
  viewId,
}: {
  fieldMetadataId: string;
  nestedRelationFieldMetadataId?: string;
  viewId?: string;
}): FieldConfiguration => ({
  __typename: 'FieldConfiguration',
  configurationType: WidgetConfigurationType.FIELD,
  fieldMetadataId,
  nestedRelationFieldMetadataId,
  viewId,
  fieldDisplayMode: FieldDisplayMode.TABLE,
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
  pageObjectMetadataId,
  configuration = null,
  unreadableObjectMetadataIds,
  objectMetadataItems = OBJECT_METADATA_ITEMS,
}: {
  type: WidgetType;
  pageObjectMetadataId: string;
  configuration?: FieldConfiguration | null;
  unreadableObjectMetadataIds: string[];
  objectMetadataItems?: typeof OBJECT_METADATA_ITEMS;
}) =>
  isPageLayoutWidgetReadable({
    widget: {
      type,
      objectMetadataId:
        type === WidgetType.IFRAME ? null : pageObjectMetadataId,
      configuration,
    },
    pageObjectMetadataId,
    objectMetadataItems,
    viewsByIdMap: VIEWS_BY_ID_MAP,
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
        pageObjectMetadataId: COMPANY_ID,
        unreadableObjectMetadataIds: [COMPANY_ID],
      }),
    ).toBe(true);
  });

  it('hides a widget bound to an object the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.RECORD_TABLE,
        pageObjectMetadataId: OPPORTUNITY_ID,
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(false);
  });

  it('hides a built-in widget whose data object the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.TASKS,
        pageObjectMetadataId: COMPANY_ID,
        unreadableObjectMetadataIds: [TASK_ID],
      }),
    ).toBe(false);
  });

  it('keeps a built-in widget when both the page object and its data object are readable', () => {
    expect(
      isReadable({
        type: WidgetType.TASKS,
        pageObjectMetadataId: COMPANY_ID,
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(true);
  });

  it('keeps a built-in widget whose data object is not in the workspace', () => {
    expect(
      isReadable({
        type: WidgetType.TASKS,
        pageObjectMetadataId: COMPANY_ID,
        unreadableObjectMetadataIds: [TASK_ID],
        objectMetadataItems: OBJECT_METADATA_ITEMS.filter(
          ({ id }) => id !== TASK_ID,
        ),
      }),
    ).toBe(true);
  });

  it('hides a related records field whose target object the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        pageObjectMetadataId: COMPANY_ID,
        configuration: buildFieldConfiguration({
          fieldMetadataId: getFieldId('company', 'opportunities'),
        }),
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(false);
  });

  it('resolves a related records field configured by name', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        pageObjectMetadataId: COMPANY_ID,
        configuration: buildFieldConfiguration({
          fieldMetadataId: 'opportunities',
        }),
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(false);
  });

  it('keeps a non-relation field widget on a readable record', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        pageObjectMetadataId: COMPANY_ID,
        configuration: buildFieldConfiguration({
          fieldMetadataId: getFieldId('company', 'name'),
        }),
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(true);
  });

  it('hides a nested relation field whose last hop the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        pageObjectMetadataId: COMPANY_ID,
        configuration: buildFieldConfiguration({
          fieldMetadataId: getFieldId('company', 'people'),
          nestedRelationFieldMetadataId: getFieldId(
            'person',
            'pointOfContactForOpportunities',
          ),
        }),
        unreadableObjectMetadataIds: [OPPORTUNITY_ID],
      }),
    ).toBe(false);
  });

  it('hides a junction field whose target behind the junction the viewer cannot read', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        pageObjectMetadataId: PERSON_ID,
        configuration: buildFieldConfiguration({
          fieldMetadataId: getFieldId('person', 'previousCompanies'),
          viewId: COMPANY_VIEW_ID,
        }),
        unreadableObjectMetadataIds: [COMPANY_ID],
      }),
    ).toBe(false);
  });

  it('keeps a junction field whose view lists the readable junction records', () => {
    expect(
      isReadable({
        type: WidgetType.FIELD,
        pageObjectMetadataId: PERSON_ID,
        configuration: buildFieldConfiguration({
          fieldMetadataId: getFieldId('person', 'previousCompanies'),
          viewId: JUNCTION_VIEW_ID,
        }),
        unreadableObjectMetadataIds: [COMPANY_ID],
      }),
    ).toBe(true);
  });
});
