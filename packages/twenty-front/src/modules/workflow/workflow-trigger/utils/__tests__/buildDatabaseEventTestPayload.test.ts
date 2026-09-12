import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildDatabaseEventTestPayload } from '@/workflow/workflow-trigger/utils/buildDatabaseEventTestPayload';

const record = {
  __typename: 'Company',
  id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  name: 'Airbnb',
  employees: 12,
} as unknown as ObjectRecord;

describe('buildDatabaseEventTestPayload', () => {
  it('exposes the record as properties.after for a created event', () => {
    expect(
      buildDatabaseEventTestPayload({
        eventName: 'company.created',
        record,
      }),
    ).toEqual({
      recordId: record.id,
      properties: { after: record },
    });
  });

  it('exposes the record on both sides for an updated event', () => {
    expect(
      buildDatabaseEventTestPayload({
        eventName: 'company.updated',
        record,
        watchedFields: ['name'],
      }),
    ).toEqual({
      recordId: record.id,
      properties: { before: record, after: record, updatedFields: ['name'] },
    });
  });

  it('falls back to every record field when the trigger watches no field', () => {
    expect(
      buildDatabaseEventTestPayload({
        eventName: 'company.upserted',
        record,
        watchedFields: [],
      }),
    ).toEqual({
      recordId: record.id,
      properties: {
        before: record,
        after: record,
        updatedFields: ['id', 'name', 'employees'],
      },
    });
  });

  it('marks deletedAt as updated for a deleted event', () => {
    expect(
      buildDatabaseEventTestPayload({
        eventName: 'company.deleted',
        record,
      }),
    ).toEqual({
      recordId: record.id,
      properties: {
        before: record,
        after: record,
        updatedFields: ['deletedAt'],
      },
    });
  });

  it('only exposes properties.before for a destroyed event', () => {
    expect(
      buildDatabaseEventTestPayload({
        eventName: 'company.destroyed',
        record,
      }),
    ).toEqual({
      recordId: record.id,
      properties: { before: record },
    });
  });
});
