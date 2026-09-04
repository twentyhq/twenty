import { type RawBodyRequest } from '@nestjs/common';

import { type Request } from 'express';
import { isPlainObject, parseJson } from 'twenty-shared/utils';

const isJsonDocument = (value: unknown): value is object =>
  isPlainObject(value) || Array.isArray(value);

// Senders routinely POST a JSON document under a form or text content type.
// Express then hands us the whole document as a single urlencoded key, or as a
// raw string, and every {{trigger.<field>}} reference resolves to undefined.
// A genuinely form-encoded body is percent-encoded, so it can never parse back
// as JSON and keeps going through the regular body parser.
export const parseWebhookTriggerPayload = (
  request: RawBodyRequest<Request>,
): object => {
  const payloadFromRawBody = parseJson<unknown>(
    request.rawBody?.toString('utf8'),
  );

  if (isJsonDocument(payloadFromRawBody)) {
    return payloadFromRawBody;
  }

  return request.body || {};
};
