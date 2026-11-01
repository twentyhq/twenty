import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  appendStudioCommandAudit,
  runAuditedStudioCommand,
} from '../studio-command-audit.ts';

class AuditClient {
  rows: Record<string, unknown>[] = [];
  loseReply = false;
  failWrite = false;
  writes = 0;
  async mutation(
    selection: Record<string, { __args: { data: Record<string, unknown> } }>,
  ) {
    this.writes++;
    if (this.failWrite) throw Error('PRIVATE_TOKEN');
    const data = selection.createStudioEvent.__args.data;
    this.rows.push({ ...data });
    if (this.loseReply) throw Error('lost reply');
    return { createStudioEvent: { id: data.id } };
  }
  async query() {
    return {
      studioEvents: {
        edges: this.rows.map((node) => ({ node })),
        pageInfo: { hasNextPage: false },
      },
    };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}

const audit = {
  command: 'createSession',
  input: {
    idempotencyKey: 'qa-key',
    token: 'PRIVATE_TOKEN',
    name: 'PRIVATE_NAME',
    participants: ['PRIVATE_DATA'],
  },
  result: { success: false, code: 'INVALID_INPUT' },
  eventType: 'MCP_COMMAND' as const,
};

test('MCP audit stores safe correlation and a separate attempt for each call', async () => {
  const client = new AuditClient();
  assert.equal(await appendStudioCommandAudit(audit, client.asClient()), true);
  assert.equal(await appendStudioCommandAudit(audit, client.asClient()), true);
  assert.equal(client.rows.length, 2);
  assert.notEqual(client.rows[0].id, client.rows[1].id);
  assert.equal(client.rows[0].idempotencyKey, 'qa-key');
  assert.equal(client.rows[0].outcome, 'FAILURE');
  assert.equal(JSON.stringify(client.rows).includes('PRIVATE_'), false);
});

test('a missing key still records the refused attempt without logging arbitrary input', async () => {
  const client = new AuditClient();
  assert.equal(
    await appendStudioCommandAudit(
      { ...audit, input: null },
      client.asClient(),
    ),
    true,
  );
  assert.match(String(client.rows[0].idempotencyKey), /^audit-attempt:/);
});

test('a lost audit reply is resolved by readback without a duplicate write', async () => {
  const client = new AuditClient();
  client.loseReply = true;
  assert.equal(await appendStudioCommandAudit(audit, client.asClient()), true);
  assert.equal(client.writes, 1);
});

test('a failed domain command records OPERATION_FAILED and preserves its result', async () => {
  const client = new AuditClient();
  const result = {
    success: false as const,
    status: 409,
    code: 'SESSION_SCHEDULE_CONFLICT',
    message: 'Занято',
  };
  assert.deepEqual(
    await runAuditedStudioCommand(
      'create',
      audit.input,
      async () => result,
      client.asClient(),
    ),
    result,
  );
  assert.equal(client.rows[0].eventType, 'OPERATION_FAILED');
});

test('failure to audit cannot be swallowed or interpreted as a safe command retry', async () => {
  const client = new AuditClient();
  client.failWrite = true;
  const result = {
    success: false as const,
    status: 409,
    code: 'IDEMPOTENCY_CONFLICT',
    message: 'Конфликт',
  };
  const actual = await runAuditedStudioCommand(
    'create',
    audit.input,
    async () => result,
    client.asClient(),
  );
  assert.equal(actual.success, false);
  assert.equal('code' in actual && actual.code, 'STUDIO_AUDIT_UNCONFIRMED');
  assert.deepEqual(
    'operationResult' in actual && actual.operationResult,
    result,
  );
  assert.equal(client.writes, 1);
});

test('an exception produces a correlated failure without disclosing an upstream secret', async () => {
  const client = new AuditClient();
  const result = await runAuditedStudioCommand(
    'create',
    audit.input,
    async () => {
      throw Error('PRIVATE_TOKEN');
    },
    client.asClient(),
  );
  assert.equal(result.success, false);
  assert.equal(
    JSON.stringify({ result, events: client.rows }).includes('PRIVATE_TOKEN'),
    false,
  );
});
