import { LOG_CONSOLE_RECORD_CHANGE_FILTER_FIELDS } from '@/log-console/constants/LogConsoleRecordChangeFilterFields';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const findObjectMetadataItem = (nameSingular: string) =>
  objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.nameSingular === nameSingular,
  )!;

const objectFilterField = LOG_CONSOLE_RECORD_CHANGE_FILTER_FIELDS.find(
  ({ id }) => id === 'object',
)!;

const getObjectOptionLabels = (
  activeObjectMetadataItems: EnrichedObjectMetadataItem[],
) =>
  objectFilterField
    .getOptions({
      activeObjectMetadataItems,
      workspaceMembers: [],
      logicFunctions: [],
      applications: [],
    })
    .map(({ label }) => label);

describe('LOG_CONSOLE_RECORD_CHANGE_FILTER_FIELDS object options', () => {
  const company = findObjectMetadataItem('company');
  const message = findObjectMetadataItem('message');

  it('lists audit-logged objects and leaves out the others', () => {
    expect(company.isAuditLogged).toBe(true);
    expect(message.isAuditLogged).toBe(false);

    expect(getObjectOptionLabels([company, message])).toEqual([
      company.labelPlural,
    ]);
  });

  it('keeps objects persisted before the flag existed', () => {
    const staleCompany: Partial<EnrichedObjectMetadataItem> = { ...company };

    delete staleCompany.isAuditLogged;

    expect(
      getObjectOptionLabels([staleCompany as EnrichedObjectMetadataItem]),
    ).toEqual([company.labelPlural]);
  });
});
