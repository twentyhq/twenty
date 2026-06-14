import { LOGIC_FUNCTION_HTTP_RESPONSE_MARKER } from 'twenty-shared/types';

import { buildRouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';

describe('buildRouteTriggerResponse', () => {
  it('wraps a plain body with status 200 and no headers', () => {
    expect(buildRouteTriggerResponse({ message: 'hi' })).toEqual({
      statusCode: 200,
      headers: {},
      body: { message: 'hi' },
    });
  });

  it('passes through null/undefined as a 200 with that body', () => {
    expect(buildRouteTriggerResponse(null)).toEqual({
      statusCode: 200,
      headers: {},
      body: null,
    });
  });

  it('reads status, headers and body from a wrapped response', () => {
    const data = {
      [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
      body: '<h1>Hi</h1>',
      status: 201,
      headers: { 'Content-Type': 'text/html' },
    };

    expect(buildRouteTriggerResponse(data)).toEqual({
      statusCode: 201,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Hi</h1>',
    });
  });

  it('defaults a wrapped response without status/headers to 200 and {}', () => {
    const data = {
      [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
      body: { ok: true },
    };

    expect(buildRouteTriggerResponse(data)).toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });
});
