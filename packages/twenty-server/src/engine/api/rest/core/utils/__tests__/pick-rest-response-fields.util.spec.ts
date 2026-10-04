import { pickRestResponseFields } from 'src/engine/api/rest/core/utils/pick-rest-response-fields.util';

describe('pickRestResponseFields', () => {
  it('should keep id and selected fields and drop columns only fetched for ordering', () => {
    expect(
      pickRestResponseFields({
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

  it('should restrict a merge dry-run preview built from every field to the selected fields', () => {
    expect(
      pickRestResponseFields({
        record: {
          id: 'preview-id',
          name: { firstName: 'Ada', lastName: 'Lovelace' },
          jobTitle: 'Engineer',
          city: 'London',
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
        selectedFields: {
          id: true,
          name: { firstName: true, lastName: true },
        },
      }),
    ).toEqual({
      id: 'preview-id',
      name: { firstName: 'Ada', lastName: 'Lovelace' },
    });
  });
});
