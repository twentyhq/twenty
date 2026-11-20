import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, metadataQueryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  metadataQueryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function () {
    return { query: metadataQueryMock };
  }),
}));

import { INDEX_VIEW_FIELDS } from 'src/constants/index-view-fields';

import healthCheck from '../health-check';

const mockIndexViews = ({
  hiddenFieldUniversalIdentifiers = [],
  absentFieldUniversalIdentifiers = [],
  viewKey = 'INDEX',
}: {
  hiddenFieldUniversalIdentifiers?: string[];
  absentFieldUniversalIdentifiers?: string[];
  viewKey?: string | null;
} = {}) =>
  metadataQueryMock.mockResolvedValue({
    objects: {
      edges: INDEX_VIEW_FIELDS.map(({ objectUniversalIdentifier, fields }) => ({
        node: {
          id: `object-${objectUniversalIdentifier}`,
          universalIdentifier: objectUniversalIdentifier,
          fieldsList: fields.map(({ universalIdentifier }) => ({
            id: `field-${universalIdentifier}`,
            universalIdentifier,
          })),
        },
      })),
    },
    getViews: INDEX_VIEW_FIELDS.map(
      ({ objectUniversalIdentifier, fields }) => ({
        key: viewKey,
        objectMetadataId: `object-${objectUniversalIdentifier}`,
        viewFields: fields
          .filter(
            ({ universalIdentifier }) =>
              !absentFieldUniversalIdentifiers.includes(universalIdentifier),
          )
          .map(({ universalIdentifier }) => ({
            fieldMetadataId: `field-${universalIdentifier}`,
            isVisible:
              !hiddenFieldUniversalIdentifiers.includes(universalIdentifier),
          })),
      }),
    ),
  });

const buildConnection = (ids: string[]) => ({
  edges: ids.map((id) => ({ node: { id } })),
});

const mockParticipants = ({
  messageParticipantIds,
  calendarEventParticipantIds,
}: {
  messageParticipantIds: string[];
  calendarEventParticipantIds: string[];
}) =>
  queryMock.mockResolvedValue({
    messageParticipants: buildConnection(messageParticipantIds),
    calendarEventParticipants: buildConnection(calendarEventParticipantIds),
  });

beforeEach(() => {
  queryMock.mockReset();
  metadataQueryMock.mockReset();
  mockIndexViews();
});

describe('health-check', () => {
  it('should be a valid health check', () => {
    expect(healthCheck.success).toBe(true);
  });

  it('should report nothing once emails are synced', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'OK',
    });
  });

  it('should report nothing once meetings are synced', async () => {
    mockParticipants({
      messageParticipantIds: [],
      calendarEventParticipantIds: ['calendar-event-participant-1'],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'OK',
    });
  });

  it('should ask to connect an account when nothing is synced', async () => {
    mockParticipants({
      messageParticipantIds: [],
      calendarEventParticipantIds: [],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'WARNING',
      title: 'No synced emails or meetings yet',
      description: expect.stringContaining('Connect a mailbox or calendar'),
      action: { label: 'Connect an account', location: '/settings/accounts' },
    });
  });

  it('should read a single participant of each kind', async () => {
    mockParticipants({
      messageParticipantIds: [],
      calendarEventParticipantIds: [],
    });

    await healthCheck.config.handler();

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0]).toMatchObject({
      messageParticipants: { __args: { first: 1 } },
      calendarEventParticipants: { __args: { first: 1 } },
    });
  });

  it('should suggest a single hidden field', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockIndexViews({
      hiddenFieldUniversalIdentifiers: [
        INDEX_VIEW_FIELDS[1].fields[1].universalIdentifier,
      ],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'INFO',
      title: 'Last contact suggests 1 field that is not in your views yet.',
      action: { label: 'Set with Ada' },
    });
  });

  it('should count hidden and absent fields across All views', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockIndexViews({
      hiddenFieldUniversalIdentifiers: [
        INDEX_VIEW_FIELDS[0].fields[0].universalIdentifier,
      ],
      absentFieldUniversalIdentifiers: [
        INDEX_VIEW_FIELDS[2].fields[0].universalIdentifier,
        INDEX_VIEW_FIELDS[2].fields[1].universalIdentifier,
      ],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'INFO',
      title: 'Last contact suggests 3 fields that are not in your views yet.',
      action: { label: 'Set with Ada' },
    });
  });

  it('should ignore objects without an All view', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockIndexViews({
      hiddenFieldUniversalIdentifiers: [
        INDEX_VIEW_FIELDS[0].fields[0].universalIdentifier,
      ],
      viewKey: null,
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'OK',
    });
  });

  it('should not read views while nothing is synced', async () => {
    mockParticipants({
      messageParticipantIds: [],
      calendarEventParticipantIds: [],
    });

    await healthCheck.config.handler();

    expect(metadataQueryMock).not.toHaveBeenCalled();
  });
});
