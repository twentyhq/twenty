import { type RoutePayload } from 'twenty-sdk/define';

// Functions triggered both by HTTP routes and by enqueued jobs receive either
// an HTTP-shaped payload or the raw job payload.
export const resolveRequestBody = <TBody extends object>(
  payload: RoutePayload<TBody> | TBody,
): TBody | null =>
  'requestContext' in payload
    ? (payload as RoutePayload<TBody>).body
    : (payload as TBody);
