import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, metadataQueryMock, kvGetMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  metadataQueryMock: vi.fn(),
  kvGetMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
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

import { ALL_VIEW_FIELDS } from 'src/constants/all-view-fields';

import healthCheck from '../health-check';

const mockAllViews = ({
  hiddenFieldUniversalIdentifier,
  inactiveFieldUniversalIdentifier,
  customApplicationId = 'custom-application',
  customViewName,
}: {
  hiddenFieldUniversalIdentifier?: string;
  inactiveFieldUniversalIdentifier?: string;
  customApplicationId?: string;
  customViewName?: string;
} = {}) =>
  metadataQueryMock.mockResolvedValue({
    currentWorkspace: { workspaceCustomApplicationId: 'custom-application' },
    objects: {
      edges: ALL_VIEW_FIELDS.map(({ objectUniversalIdentifier, fields }) => ({
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
    getViews: ALL_VIEW_FIELDS.flatMap(
      ({ objectUniversalIdentifier, objectLabelPlural, fields }) => [
        {
          name: `All ${objectLabelPlural}`,
          isActive: true,
          applicationId: 'standard-application',
          objectMetadataId: `object-${objectUniversalIdentifier}`,
          viewFields: fields.map(({ universalIdentifier }) => ({
            fieldMetadataId: `field-${universalIdentifier}`,
            isVisible: true,
            isActive: true,
          })),
        },
        {
          name: customViewName ?? `All ${objectLabelPlural}`,
          isActive: true,
          applicationId: customApplicationId,
          objectMetadataId: `object-${objectUniversalIdentifier}`,
          viewFields: fields.map(({ universalIdentifier }) => ({
            fieldMetadataId: `field-${universalIdentifier}`,
            isVisible: universalIdentifier !== hiddenFieldUniversalIdentifier,
            isActive: universalIdentifier !== inactiveFieldUniversalIdentifier,
          })),
        },
      ],
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
  kvGetMock.mockReset();
  kvGetMock.mockResolvedValue(null);
  mockAllViews();
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

  it('should point to the settings tab when a custom All view hides a column', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockAllViews({
      hiddenFieldUniversalIdentifier:
        ALL_VIEW_FIELDS[1].fields[0].universalIdentifier,
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'WARNING',
      title: 'Last contact columns are not shown',
      description: expect.stringContaining('All Companies views'),
      action: { label: 'Open settings', location: '#settings' },
    });
  });

  it('should count an inactive view field as not shown', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockAllViews({
      inactiveFieldUniversalIdentifier:
        ALL_VIEW_FIELDS[2].fields[0].universalIdentifier,
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'WARNING',
      title: 'Last contact columns are not shown',
      description: expect.stringContaining('All Opportunities views'),
      action: { label: 'Open settings', location: '#settings' },
    });
  });

  it('should not read views once the suggestion is dismissed', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    kvGetMock.mockResolvedValue({ isDismissed: true });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'OK',
    });
    expect(kvGetMock).toHaveBeenCalledWith('view-fields-suggestion-dismissed');
    expect(metadataQueryMock).not.toHaveBeenCalled();
  });

  it('should match All views stored with the label template', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockAllViews({
      hiddenFieldUniversalIdentifier:
        ALL_VIEW_FIELDS[0].fields[0].universalIdentifier,
      customViewName: 'All {objectLabelPlural}',
    });

    await expect(healthCheck.config.handler()).resolves.toMatchObject({
      status: 'WARNING',
      description: expect.stringContaining('All People views'),
    });
  });

  it('should ignore other views of the custom application', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockAllViews({
      hiddenFieldUniversalIdentifier:
        ALL_VIEW_FIELDS[0].fields[0].universalIdentifier,
      customViewName: 'My people',
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'OK',
    });
  });

  it('should ignore All views that do not belong to the custom application', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });
    mockAllViews({
      hiddenFieldUniversalIdentifier:
        ALL_VIEW_FIELDS[0].fields[0].universalIdentifier,
      customApplicationId: 'other-application',
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
