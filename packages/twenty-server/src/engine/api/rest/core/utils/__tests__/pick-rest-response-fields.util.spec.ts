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
          fields: { jobTitle: true, companyId: true },
          aggregates: [],
          relations: {
            company: {
              fieldName: 'company',
              selectedFields: {
                fields: { id: true, name: true },
                aggregates: [],
                relations: {},
              },
            },
          },
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
