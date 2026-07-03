import { beforeEach, describe, expect, it, vi } from 'vitest';

import { summarizeCallRecordingHandler } from 'src/logic-functions/summarize-call-recording';

const generateCallRecordingSummaryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock(
  'src/logic-functions/flows/generate-call-recording-summary.util',
  () => ({
    generateCallRecordingSummary: generateCallRecordingSummaryMock,
  }),
);

const FAKE_OBJECT_METADATA = {
  id: 'object-metadata-id',
  nameSingular: 'callRecording',
  namePlural: 'callRecordings',
  labelSingular: 'Call Recording',
  labelPlural: 'Call Recordings',
  description: null,
  icon: null,
  universalIdentifier: 'call-recording-object',
  applicationId: null,
  dataSourceId: null,
  standardOverrides: null,
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isUIEditable: false,
  isUICreatable: false,
  isAuditLogged: false,
  isSearchable: false,
  duplicateCriteria: null,
  shortcut: null,
  labelIdentifierFieldMetadataId: 'label-field-id',
  imageIdentifierFieldMetadataId: null,
  isLabelSyncedWithName: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  fieldIds: [],
  indexMetadataIds: [],
  viewIds: [],
  applicationUniversalIdentifier: null,
  labelIdentifierFieldMetadataUniversalIdentifier: 'label-field',
  imageIdentifierFieldMetadataUniversalIdentifier: null,
  fieldUniversalIdentifiers: [],
  indexMetadataUniversalIdentifiers: [],
  viewUniversalIdentifiers: [],
} satisfies Parameters<
  typeof summarizeCallRecordingHandler
>[0]['objectMetadata'];

const buildEvent = ({
  name,
  updatedFields,
  recordId = 'call-recording-1',
}: {
  name: string;
  updatedFields: string[];
  recordId?: string;
}): Parameters<typeof summarizeCallRecordingHandler>[0] => ({
  name,
  workspaceId: 'workspace-id',
  objectMetadata: FAKE_OBJECT_METADATA,
  recordId,
  properties: { updatedFields },
});

describe('summarize-call-recording logic function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateCallRecordingSummaryMock.mockResolvedValue({
      outcome: 'generated',
    });
  });

  it('generates a summary when the transcript field changed', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.updated',
        updatedFields: ['transcript'],
      }),
    );

    expect(generateCallRecordingSummaryMock).toHaveBeenCalledWith(
      expect.anything(),
      {
        callRecordingId: 'call-recording-1',
        requireCreatedByCallRecorder: true,
      },
    );
    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      outcome: 'generated',
    });
  });

  it('skips summary-only updates to avoid re-entrancy', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.updated',
        updatedFields: ['summary'],
      }),
    );

    expect(generateCallRecordingSummaryMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'transcript unchanged' });
  });

  it('skips non-update events', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.created',
        updatedFields: ['transcript'],
      }),
    );

    expect(generateCallRecordingSummaryMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      reason: 'not a call recording update',
    });
  });
});
