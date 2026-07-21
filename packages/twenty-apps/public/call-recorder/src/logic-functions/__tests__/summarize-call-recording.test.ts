import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { summarizeCallRecordingHandler } from 'src/logic-functions/summarize-call-recording';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));

const TRANSCRIPT = [
  {
    participant: { name: 'Alex' },
    words: [{ text: 'Hello' }, { text: 'team' }],
  },
];

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
  overrides: null,
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
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'true');
    vi.stubEnv('CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT', '');
    queryMock.mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              id: 'call-recording-1',
              title: 'Weekly sync',
              transcript: TRANSCRIPT,
              summary: { markdown: null },
              createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
            },
          },
        ],
      },
    });
    mutationMock.mockResolvedValue({});
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: '## Overview\nGood call.' },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('generates a summary when the transcript field changed', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.updated',
        updatedFields: ['transcript'],
      }),
    );

    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      outcome: 'generated',
    });
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: 'call-recording-1',
          data: {
            summary: { blocknote: null, markdown: '## Overview\nGood call.' },
          },
        },
        id: true,
      },
    });
  });

  it('skips summary-only updates to avoid re-entrancy', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.updated',
        updatedFields: ['summary'],
      }),
    );

    expect(queryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'transcript unchanged' });
  });

  it('skips non-update events', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.created',
        updatedFields: ['transcript'],
      }),
    );

    expect(queryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      reason: 'not a call recording update',
    });
  });
});
