import { pickSelectedFieldsFromRecord } from 'src/engine/api/rest/core/utils/pick-selected-fields-from-record.util';

describe('pickSelectedFieldsFromRecord', () => {
  it('should keep id and selected fields and drop columns only fetched for ordering', () => {
    expect(
      pickSelectedFieldsFromRecord({
        record: {
          id: 'record-id',
          jobTitle: 'Engineer',
          position: 3,
          emails: { primaryEmail: 'test@example.com' },
          companyId: 'company-id',
          company: { id: 'company-id', name: 'Company' },
        },
        selectedFields: {
          jobTitle: true,
          companyId: true,
          company: { id: true, name: true },
        },
      }),
    ).toEqual({
      id: 'record-id',
      jobTitle: 'Engineer',
      companyId: 'company-id',
      company: { id: 'company-id', name: 'Company' },
    });
  });
});
