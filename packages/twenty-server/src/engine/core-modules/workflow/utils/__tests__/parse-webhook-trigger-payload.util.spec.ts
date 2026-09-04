import { type RawBodyRequest } from '@nestjs/common';

import { type Request } from 'express';

import { parseWebhookTriggerPayload } from 'src/engine/core-modules/workflow/utils/parse-webhook-trigger-payload.util';

const buildRequest = ({
  body,
  rawBody,
}: {
  body?: unknown;
  rawBody?: string;
}) =>
  ({
    body,
    rawBody: rawBody === undefined ? undefined : Buffer.from(rawBody),
  }) as RawBodyRequest<Request>;

describe('parseWebhookTriggerPayload', () => {
  it('returns the parsed body of an application/json request', () => {
    const request = buildRequest({
      body: { companyName: 'Twenty' },
      rawBody: '{"companyName":"Twenty"}',
    });

    expect(parseWebhookTriggerPayload(request)).toEqual({
      companyName: 'Twenty',
    });
  });

  it('recovers a JSON document sent under a form content type', () => {
    const request = buildRequest({
      body: { '{"companyName":"Twenty"}': '' },
      rawBody: '{"companyName":"Twenty"}',
    });

    expect(parseWebhookTriggerPayload(request)).toEqual({
      companyName: 'Twenty',
    });
  });

  it('recovers a JSON document sent under a text content type', () => {
    const request = buildRequest({
      body: '{"companyName":"Twenty"}',
      rawBody: '{"companyName":"Twenty"}',
    });

    expect(parseWebhookTriggerPayload(request)).toEqual({
      companyName: 'Twenty',
    });
  });

  it('keeps a genuinely form-encoded body', () => {
    const request = buildRequest({
      body: { companyName: 'Twenty', need: 'a b' },
      rawBody: 'companyName=Twenty&need=a+b',
    });

    expect(parseWebhookTriggerPayload(request)).toEqual({
      companyName: 'Twenty',
      need: 'a b',
    });
  });

  it('keeps a JSON array payload', () => {
    const request = buildRequest({
      body: [{ companyName: 'Twenty' }],
      rawBody: '[{"companyName":"Twenty"}]',
    });

    expect(parseWebhookTriggerPayload(request)).toEqual([
      { companyName: 'Twenty' },
    ]);
  });

  it('ignores a raw body that parses to a scalar', () => {
    const request = buildRequest({ body: {}, rawBody: '42' });

    expect(parseWebhookTriggerPayload(request)).toEqual({});
  });

  it('falls back to an empty payload when there is no body', () => {
    expect(parseWebhookTriggerPayload(buildRequest({}))).toEqual({});
  });
});
