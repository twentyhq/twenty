import { describe, expect, it } from 'vitest';

import {
  createCoreApiClientMock,
  getFilter,
  getInValues,
  toPage,
} from 'src/logic-functions/handlers/__mocks__/create-core-api-client-mock';
import { recomputeCompanies } from 'src/logic-functions/handlers/recompute-companies';

const OLDER = '2026-01-01T10:00:00.000Z';
const NEWER = '2026-02-01T10:00:00.000Z';

describe('recomputeCompanies', () => {
  it('should take the most recent contact across the people of the company', async () => {
    const { client, mutations } = createCoreApiClientMock({
      companies: (args) =>
        toPage(getInValues(getFilter(args), 'id').map((id) => ({ id }))),
      people: () =>
        toPage([
          { id: 'person-1', companyId: 'company-1' },
          { id: 'person-2', companyId: 'company-1' },
        ]),
      messageParticipants: (args) => {
        if (getFilter(args).workspaceMemberId) {
          return toPage([]);
        }

        return toPage([
          {
            id: 'participant-1',
            personId: 'person-1',
            message: { id: 'older-message', receivedAt: OLDER },
          },
          {
            id: 'participant-2',
            personId: 'person-2',
            message: { id: 'newer-message', receivedAt: NEWER },
          },
        ]);
      },
      calendarEventParticipants: () => toPage([]),
    });

    const updated = await recomputeCompanies(client, ['company-1']);

    expect(updated).toBe(1);
    expect(mutations).toEqual([
      {
        name: 'updateCompany',
        args: {
          id: 'company-1',
          data: {
            lastContactAt: NEWER,
            lastContactItemMessageId: 'newer-message',
            lastContactItemCalendarEventId: null,
          },
        },
      },
    ]);
  });

  it('should clear a company whose people have no interaction', async () => {
    const { client, mutations } = createCoreApiClientMock({
      companies: () => toPage([{ id: 'company-1' }]),
      people: () => toPage([{ id: 'person-1', companyId: 'company-1' }]),
      messageParticipants: () => toPage([]),
      calendarEventParticipants: () => toPage([]),
    });

    await recomputeCompanies(client, ['company-1']);

    expect(mutations[0].args.data).toEqual({
      lastContactAt: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });

  it('should clear a company that has no people at all', async () => {
    const { client, mutations } = createCoreApiClientMock({
      companies: () => toPage([{ id: 'company-1' }]),
      people: () => toPage([]),
    });

    await recomputeCompanies(client, ['company-1']);

    expect(mutations[0].args.data).toMatchObject({ lastContactAt: null });
  });

  it('should scope the people query to the selected companies', async () => {
    const peopleFilters: unknown[] = [];

    const { client } = createCoreApiClientMock({
      companies: (args) =>
        toPage(getInValues(getFilter(args), 'id').map((id) => ({ id }))),
      people: (args) => {
        peopleFilters.push(getFilter(args));

        return toPage([]);
      },
    });

    await recomputeCompanies(client, ['company-1', 'company-2']);

    expect(peopleFilters).toEqual([
      { companyId: { in: ['company-1', 'company-2'] } },
    ]);
  });
});
