import { beforeEach, describe, expect, it, vi } from 'vitest';

import { upsertRecordsInBatches } from 'src/utils/upsert-records-in-batches';

const buildRecords = (count: number) =>
  Array.from({ length: count }, (_unused, index) => ({
    id: `person-${index}`,
    lastContactAt: '2026-06-10T09:00:00.000Z',
  }));

let client: { query: ReturnType<typeof vi.fn>; mutation: ReturnType<typeof vi.fn> };

beforeEach(() => {
  client = { query: vi.fn(), mutation: vi.fn().mockResolvedValue({}) };
});

describe('upsertRecordsInBatches', () => {
  it('writes a whole batch of distinct payloads in one call', async () => {
    await upsertRecordsInBatches(client as never, 'createPeople', buildRecords(200));

    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(client.mutation.mock.calls[0][0].createPeople.__args.upsert).toBe(
      true,
    );
    expect(
      client.mutation.mock.calls[0][0].createPeople.__args.data,
    ).toHaveLength(200);
  });

  it('splits at the maximum number of records the API accepts', async () => {
    await upsertRecordsInBatches(client as never, 'createPeople', buildRecords(201));

    expect(client.mutation).toHaveBeenCalledTimes(2);
    expect(
      client.mutation.mock.calls[1][0].createPeople.__args.data,
    ).toHaveLength(1);
  });

  it('does not call the API when there is nothing to write', async () => {
    await upsertRecordsInBatches(client as never, 'createCompanies', []);

    expect(client.mutation).not.toHaveBeenCalled();
  });
});
