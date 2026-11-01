import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RestApiClientError,
  type RestApiRequestOptions,
} from 'twenty-client-sdk/rest';

import createSession from '../../studio-mcp-create-class-session.ts';
import createPayment from '../../studio-mcp-create-session-payment.ts';
import createRegularBooking from '../../studio-mcp-create-regular-booking.ts';
import createPayAsYouGoBooking from '../../studio-mcp-create-pay-as-you-go-booking.ts';
import { runStudioTool as executeStudioTool } from '../run-studio-tool.ts';
import { type StudioCommandAudit } from '../studio-command-audit.ts';
import { validateStudioToolInput } from '../studio-tool-input.ts';

const AUDIT_EVENTS: StudioCommandAudit[] = [];
const runStudioTool: typeof executeStudioTool = (
  command,
  input,
  transport,
  audit,
  actor,
) =>
  executeStudioTool(
    command,
    input,
    transport,
    audit ??
      (async (event) => {
        AUDIT_EVENTS.push(event);
        return true;
      }),
    actor,
  );

const PERSON_ID = '11111111-1111-4111-8111-111111111111';
const MEMBERSHIP_ID = '22222222-2222-4222-8222-222222222222';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';
const INPUT = {
  name: 'Группа на реформере',
  sessionFormat: 'GROUP_REFORMER',
  startsAt: '2099-10-30T09:00:00+03:00',
  durationMinutes: 55,
  capacity: 4,
  status: 'PLANNED',
  idempotencyKey: 'stable-create-key',
  participants: [{ personId: PERSON_ID, membershipId: MEMBERSHIP_ID }],
};

class FakeTransport {
  calls: { path: string; body: unknown; signal?: AbortSignal }[] = [];
  response: unknown = {
    success: true,
    classSessionId: SESSION_ID,
    duplicate: false,
  };
  error: Error | undefined;

  async post<TResponse = unknown>(
    path: string,
    body?: unknown,
    options?: RestApiRequestOptions,
  ): Promise<TResponse> {
    this.calls.push({ path, body, signal: options?.signal });
    if (this.error) throw this.error;
    return this.response as TResponse;
  }
}

test('four native tools declare distinct identities and learnable input schemas without HTTP routes', () => {
  const definitions = [
    createSession,
    createPayment,
    createRegularBooking,
    createPayAsYouGoBooking,
  ];
  assert.equal(
    new Set(
      definitions.map((definition) => definition.config.universalIdentifier),
    ).size,
    4,
  );
  for (const definition of definitions) {
    assert.equal(definition.success, true);
    assert.match(definition.config.name, /^studio-mcp-create-/);
    assert.equal(definition.config.httpRouteTriggerSettings, undefined);
    assert.equal(
      definition.config.toolTriggerSettings?.inputSchema?.additionalProperties,
      false,
    );
    assert.ok(
      definition.config.toolTriggerSettings?.inputSchema?.required?.includes(
        'idempotencyKey',
      ),
    );
  }
});

test('forwards direct MCP arguments to the protected session route and preserves the key', async () => {
  const transport = new FakeTransport();
  const result = await runStudioTool('createSession', INPUT, transport);
  assert.deepEqual(result, transport.response);
  assert.equal(transport.calls.length, 1);
  assert.equal(transport.calls[0].path, '/s/studio/sessions/create');
  assert.deepEqual(transport.calls[0].body, INPUT);
  assert.ok(transport.calls[0].signal instanceof AbortSignal);
  await runStudioTool('createSession', INPUT, transport);
  assert.deepEqual(transport.calls[0].body, transport.calls[1].body);
});

for (const [label, input] of [
  [
    'short UUID',
    {
      ...INPUT,
      participants: [{ personId: '04d3b556', membershipId: MEMBERSHIP_ID }],
    },
  ],
  ['actor spoof', { ...INPUT, userWorkspaceId: 'spoofed' }],
  ['URL override', { ...INPUT, url: 'https://untrusted.invalid' }],
  ['HTTP body envelope', { body: INPUT }],
  ['empty key', { ...INPUT, idempotencyKey: ' ' }],
  ['long key', { ...INPUT, idempotencyKey: 'x'.repeat(201) }],
  ['no timezone', { ...INPUT, startsAt: '2099-10-30T09:00:00' }],
  ['invalid date', { ...INPUT, startsAt: 'invalid' }],
  ['capacity', { ...INPUT, capacity: 101 }],
  ['fractional duration', { ...INPUT, durationMinutes: 55.5 }],
  ['unknown format', { ...INPUT, sessionFormat: 'UNKNOWN' }],
  [
    'personal capacity',
    { ...INPUT, sessionFormat: 'PERSONAL_EQUIPMENT', capacity: 4 },
  ],
  [
    'duplicate participants',
    { ...INPUT, participants: [INPUT.participants[0], INPUT.participants[0]] },
  ],
  [
    'too many participants',
    {
      ...INPUT,
      capacity: 1,
      participants: [
        INPUT.participants[0],
        { personId: SESSION_ID, membershipId: MEMBERSHIP_ID },
      ],
    },
  ],
  [
    'mixed payment and package',
    {
      ...INPUT,
      participants: [
        {
          ...INPUT.participants[0],
          paymentId: SESSION_ID,
          productId: SESSION_ID,
        },
      ],
    },
  ],
  [
    'missing payment',
    {
      ...INPUT,
      participants: [{ personId: PERSON_ID, productId: SESSION_ID }],
    },
  ],
  ['participants in current session', { ...INPUT, status: 'CONFIRMED' }],
  ['split participants', { ...INPUT, sessionFormat: 'SPLIT_EQUIPMENT' }],
  [
    'past without confirmation',
    { ...INPUT, status: 'COMPLETED', attendanceReason: 'По журналу' },
  ],
  [
    'past without reason',
    { ...INPUT, status: 'COMPLETED', pastConfirmed: true },
  ],
] as const) {
  test(`rejects ${label} before any transport call`, async () => {
    const transport = new FakeTransport();
    const result = await runStudioTool('createSession', input, transport);
    assert.equal(result.success, false);
    assert.equal(result.code, 'STUDIO_TOOL_INVALID_INPUT');
    assert.equal(transport.calls.length, 0);
  });
}

test('supports mixed package and previously prepared payment participants', () => {
  assert.equal(
    validateStudioToolInput('createSession', {
      ...INPUT,
      participants: [
        INPUT.participants[0],
        { personId: SESSION_ID, paymentId: SESSION_ID, productId: SESSION_ID },
      ],
    }).success,
    true,
  );
});

test('future debt and explicitly confirmed past payment use the same installed payment route', async () => {
  const transport = new FakeTransport();
  transport.response = {
    success: true,
    paymentId: SESSION_ID,
    duplicate: false,
  };
  const payment = {
    personId: PERSON_ID,
    productId: MEMBERSHIP_ID,
    sessionFormat: 'GROUP_REFORMER',
    startsAt: INPUT.startsAt,
    durationMinutes: 55,
    status: 'PLANNED',
    paymentMethod: 'SBP',
    idempotencyKey: 'stable-payment-key',
  };
  assert.equal(
    (await runStudioTool('createSessionPayment', payment, transport)).success,
    true,
  );
  assert.equal(transport.calls[0].path, '/s/studio/sessions/payment');
  const past = { ...payment, status: 'COMPLETED' };
  assert.equal(
    (await runStudioTool('createSessionPayment', past, transport)).success,
    false,
  );
  assert.equal(transport.calls.length, 1);
  assert.equal(
    (
      await runStudioTool(
        'createSessionPayment',
        { ...past, paymentReceivedConfirmed: true },
        transport,
      )
    ).success,
    true,
  );
  assert.deepEqual(transport.calls[1].body, past);
});

test('uses distinct package and expected-payment routes for existing training', async () => {
  const transport = new FakeTransport();
  transport.response = { success: true, bookingId: SESSION_ID };
  const common = {
    personId: PERSON_ID,
    classSessionId: SESSION_ID,
    idempotencyKey: 'stable-booking-key',
  };
  assert.equal(
    (
      await runStudioTool(
        'createRegularBooking',
        { ...common, membershipId: MEMBERSHIP_ID },
        transport,
      )
    ).success,
    true,
  );
  assert.equal(transport.calls[0].path, '/s/studio/bookings/create');
  assert.equal(
    (
      await runStudioTool(
        'createPayAsYouGoBooking',
        { ...common, productId: MEMBERSHIP_ID },
        transport,
      )
    ).success,
    true,
  );
  assert.equal(
    transport.calls[1].path,
    '/s/studio/bookings/create-pay-as-you-go',
  );
});

test('preserves a domain rejection and its partial-result details', async () => {
  const transport = new FakeTransport();
  const body = {
    success: false,
    code: 'ATTENDANCE_INCOMPLETE',
    message: 'Тренировка сохранена, требуется сверка.',
    classSessionId: SESSION_ID,
  };
  transport.error = new RestApiClientError('conflict', { status: 409, body });
  assert.deepEqual(await runStudioTool('createSession', INPUT, transport), {
    ...body,
    status: 409,
  });
  assert.equal(transport.calls.length, 1);
});

for (const response of [
  undefined,
  {},
  { success: true },
  { success: 'true' },
  { success: true, classSessionId: 1 },
]) {
  test(`treats an incomplete response as unconfirmed: ${JSON.stringify(response)}`, async () => {
    const transport = new FakeTransport();
    transport.response = response;
    const result = await runStudioTool('createSession', INPUT, transport);
    assert.equal(result.success, false);
    assert.equal(result.code, 'STUDIO_TOOL_RESULT_UNCONFIRMED');
    assert.equal(transport.calls.length, 1);
  });
}

for (const error of [
  new Error('timeout'),
  new RestApiClientError('route missing', { status: 404 }),
  new RestApiClientError('proxy failure', {
    status: 502,
    body: 'gateway error',
  }),
]) {
  test(`never retries an uncertain transport error: ${error.message}`, async () => {
    const transport = new FakeTransport();
    transport.error = error;
    assert.equal(
      (await runStudioTool('createSession', INPUT, transport)).code,
      'STUDIO_TOOL_RESULT_UNCONFIRMED',
    );
    assert.equal(transport.calls.length, 1);
  });
}

test('validation failures and successful replays produce independent MCP audit attempts', async () => {
  const start = AUDIT_EVENTS.length;
  const transport = new FakeTransport();
  await runStudioTool('createSession', {}, transport);
  await runStudioTool('createSession', INPUT, transport);
  await runStudioTool('createSession', INPUT, transport);
  assert.equal(AUDIT_EVENTS.length - start, 3);
  assert.deepEqual(
    AUDIT_EVENTS.slice(start).map((event) => event.result.success),
    [false, true, true],
  );
  assert.ok(
    AUDIT_EVENTS.slice(start).every(
      (event) => event.eventType === 'MCP_COMMAND',
    ),
  );
});

test('a missing MCP audit cannot be presented as successful or safe to retry', async () => {
  const transport = new FakeTransport();
  const result = await runStudioTool(
    'createSession',
    INPUT,
    transport,
    async () => false,
  );
  assert.equal(result.success, false);
  assert.equal(result.code, 'STUDIO_TOOL_AUDIT_UNCONFIRMED');
  assert.deepEqual(result.operationResult, transport.response);
  assert.equal(transport.calls.length, 1);
});
