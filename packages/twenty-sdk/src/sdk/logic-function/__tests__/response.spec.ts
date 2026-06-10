import { isLogicFunctionHttpResponse } from 'twenty-shared/types';

import { Response } from '@/sdk/logic-function/response';

describe('Response', () => {
  it('stores body, status and headers', () => {
    const response = new Response('<h1>Hi</h1>', {
      status: 201,
      headers: { 'Content-Type': 'text/html' },
    });

    expect(response.body).toBe('<h1>Hi</h1>');
    expect(response.status).toBe(201);
    expect(response.headers).toEqual({ 'Content-Type': 'text/html' });
  });

  it('defaults status and headers to undefined', () => {
    const response = new Response({ ok: true });

    expect(response.status).toBeUndefined();
    expect(response.headers).toBeUndefined();
  });

  it('is detected as an http response after JSON round-trip', () => {
    const response = new Response({ ok: true }, { status: 200 });

    const roundTripped = JSON.parse(JSON.stringify(response));

    expect(isLogicFunctionHttpResponse(roundTripped)).toBe(true);
    expect(roundTripped.body).toEqual({ ok: true });
    expect(roundTripped.status).toBe(200);
  });
});
