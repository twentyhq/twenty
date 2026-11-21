import { getScopedRelationColumnQueryFingerprint } from '@/object-record/record-column-scope/utils/getScopedRelationColumnQueryFingerprint';
import { type RecordGqlFields } from 'twenty-shared/types';

const getPeopleRecordGqlFields = ({
  responseKey,
  recordGqlFields,
}: {
  responseKey: string;
  recordGqlFields: RecordGqlFields;
}): RecordGqlFields => ({
  [responseKey]: { relationFieldName: 'people', recordGqlFields },
});

describe('getScopedRelationColumnQueryFingerprint', () => {
  it('changes with the scope of a column', () => {
    expect(
      getScopedRelationColumnQueryFingerprint(
        getPeopleRecordGqlFields({
          responseKey: 'people_limited',
          recordGqlFields: { id: true },
        }),
      ),
    ).not.toBe(
      getScopedRelationColumnQueryFingerprint(
        getPeopleRecordGqlFields({
          responseKey: 'people_all',
          recordGqlFields: { id: true },
        }),
      ),
    );
  });

  it('changes when a column selects another field of the same related records', () => {
    expect(
      getScopedRelationColumnQueryFingerprint(
        getPeopleRecordGqlFields({
          responseKey: 'people_all',
          recordGqlFields: { id: true, emails: true },
        }),
      ),
    ).not.toBe(
      getScopedRelationColumnQueryFingerprint(
        getPeopleRecordGqlFields({
          responseKey: 'people_all',
          recordGqlFields: { id: true, jobTitle: true },
        }),
      ),
    );
  });

  it('ignores the order of the scoped relations and of their fields', () => {
    expect(
      getScopedRelationColumnQueryFingerprint({
        ...getPeopleRecordGqlFields({
          responseKey: 'people_all',
          recordGqlFields: { id: true, emails: true },
        }),
        ...getPeopleRecordGqlFields({
          responseKey: 'people_limited',
          recordGqlFields: { id: true },
        }),
      }),
    ).toBe(
      getScopedRelationColumnQueryFingerprint({
        ...getPeopleRecordGqlFields({
          responseKey: 'people_limited',
          recordGqlFields: { id: true },
        }),
        ...getPeopleRecordGqlFields({
          responseKey: 'people_all',
          recordGqlFields: { emails: true, id: true },
        }),
      }),
    );
  });
});
