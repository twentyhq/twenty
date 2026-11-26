import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { isPageLayoutWidgetReadable } from '@/page-layout/utils/isPageLayoutWidgetReadable';
import { WidgetType } from '~/generated-metadata/graphql';

const COMPANY_ID = 'company-id';
const TASK_ID = 'task-id';
const OPPORTUNITY_ID = 'opportunity-id';

const OBJECT_METADATA_ITEMS = [
  { id: COMPANY_ID, nameSingular: 'company' },
  { id: TASK_ID, nameSingular: 'task' },
  { id: OPPORTUNITY_ID, nameSingular: 'opportunity' },
];

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
  unreadableObjectMetadataIds,
}: {
  type: WidgetType;
  objectMetadataId?: string | null;
  unreadableObjectMetadataIds: string[];
}) =>
  isPageLayoutWidgetReadable({
    widget: { type, objectMetadataId },
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
});
