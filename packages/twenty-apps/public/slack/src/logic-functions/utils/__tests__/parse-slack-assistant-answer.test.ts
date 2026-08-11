import { describe, expect, it } from 'vitest';
import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { parseSlackAssistantAnswer } from 'src/logic-functions/utils/parse-slack-assistant-answer';

const RECORD_ID = '20202020-89ab-4cde-8f01-234567890abc';

const buildResult = (result: object | null): RunAgentResult => ({
  success: true,
  error: null,
  result,
});

const buildRecordsJson = (records: object[]): string => JSON.stringify(records);

describe('parseSlackAssistantAnswer', () => {
  it('should parse prose, layout and records', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({
        answer: '  Created the task.  ',
        layout: 'record',
        records: buildRecordsJson([
          {
            objectNameSingular: 'task',
            recordId: RECORD_ID,
            name: 'Follow up',
            fields: [{ label: 'Status', value: 'Todo' }],
          },
        ]),
      }),
    );

    expect(answer).toEqual({
      answer: 'Created the task.',
      layout: 'record',
      records: [
        {
          objectNameSingular: 'task',
          recordId: RECORD_ID,
          name: 'Follow up',
          fields: [{ label: 'Status', value: 'Todo' }],
        },
      ],
    });
  });

  it('should return undefined when the agent run did not succeed', () => {
    expect(
      parseSlackAssistantAnswer({
        success: false,
        error: 'boom',
        result: null,
      }),
    ).toBeUndefined();
    expect(parseSlackAssistantAnswer(buildResult(null))).toBeUndefined();
  });

  it('should fall back to plain layout when no record survives validation', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({
        answer: 'Here you go.',
        layout: 'list',
        records: buildRecordsJson([
          { objectNameSingular: 'task', recordId: 'not-a-uuid', name: 'Nope' },
        ]),
      }),
    );

    expect(answer).toEqual({
      answer: 'Here you go.',
      layout: 'plain',
      records: [],
    });
  });

  it('should drop records missing a name or object name rather than rendering them', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({
        answer: 'Two of three are usable.',
        layout: 'list',
        records: buildRecordsJson([
          { objectNameSingular: 'task', recordId: RECORD_ID, name: 'Keep me' },
          { objectNameSingular: 'task', recordId: RECORD_ID },
          { recordId: RECORD_ID, name: 'No object name' },
        ]),
      }),
    );

    expect(answer?.records).toEqual([
      {
        objectNameSingular: 'task',
        recordId: RECORD_ID,
        name: 'Keep me',
        fields: [],
      },
    ]);
  });

  it('should survive malformed records json', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({
        answer: 'Still an answer.',
        layout: 'list',
        records: '{ not json',
      }),
    );

    expect(answer).toEqual({
      answer: 'Still an answer.',
      layout: 'plain',
      records: [],
    });
  });

  it('should fall back to placeholder prose when the answer is blank', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({ answer: '   ', layout: 'plain', records: '[]' }),
    );

    expect(answer?.answer).toContain('did not get a text summary');
  });

  it('should default an unknown layout to plain', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({
        answer: 'Hi.',
        layout: 'carousel',
        records: buildRecordsJson([
          { objectNameSingular: 'task', recordId: RECORD_ID, name: 'Task' },
        ]),
      }),
    );

    expect(answer?.layout).toBe('plain');
  });

  it('should cap records at the summary maximum', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({
        answer: 'Many.',
        layout: 'list',
        records: buildRecordsJson(
          Array.from({ length: 9 }, () => ({
            objectNameSingular: 'company',
            recordId: RECORD_ID,
            name: 'Acme',
          })),
        ),
      }),
    );

    expect(answer?.records).toHaveLength(5);
  });

  it('should drop non-string field entries instead of failing the record', () => {
    const answer = parseSlackAssistantAnswer(
      buildResult({
        answer: 'Mixed fields.',
        layout: 'record',
        records: buildRecordsJson([
          {
            objectNameSingular: 'task',
            recordId: RECORD_ID,
            name: 'Task',
            fields: [
              { label: 'Status', value: 'Todo' },
              { label: 'Broken', value: 42 },
              'nope',
            ],
          },
        ]),
      }),
    );

    expect(answer?.records[0].fields).toEqual([
      { label: 'Status', value: 'Todo' },
    ]);
  });
});
