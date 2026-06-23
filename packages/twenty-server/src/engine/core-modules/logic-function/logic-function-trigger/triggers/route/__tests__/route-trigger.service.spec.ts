import { type Response } from 'express';
import { LOGIC_FUNCTION_HTTP_RESPONSE_MARKER } from 'twenty-shared/types';

import {
  buildRouteTriggerResponse,
  sendRouteTriggerResponse,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';

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

describe('sendRouteTriggerResponse', () => {
  const createResponseMock = () => {
    const headers: Record<string, string> = {};

    return {
      status: jest.fn(),
      setHeader: jest.fn((key: string, value: string) => {
        headers[key.toLowerCase()] = value;
      }),
      getHeader: jest.fn((key: string) => headers[key.toLowerCase()]),
      send: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;
  };

  it('keeps only allow-listed headers by default', () => {
    const response = createResponseMock();

    sendRouteTriggerResponse(response, {
      statusCode: 200,
      headers: { 'Cache-Control': 'no-store', 'X-Custom': 'foo' },
      body: null,
    });

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store',
    );
    expect(response.setHeader).not.toHaveBeenCalledWith('X-Custom', 'foo');
  });

  it('passes through all headers when allowAllHeaders is true', () => {
    const response = createResponseMock();

    sendRouteTriggerResponse(
      response,
      {
        statusCode: 200,
        headers: {
          'X-Custom': 'foo',
          'Permissions-Policy': 'geolocation=()',
          'Set-Cookie': 'a=b',
        },
        body: null,
      },
      { allowAllHeaders: true },
    );

    expect(response.setHeader).toHaveBeenCalledWith('X-Custom', 'foo');
    expect(response.setHeader).toHaveBeenCalledWith(
      'Permissions-Policy',
      'geolocation=()',
    );
    expect(response.setHeader).toHaveBeenCalledWith('Set-Cookie', 'a=b');
  });
});
