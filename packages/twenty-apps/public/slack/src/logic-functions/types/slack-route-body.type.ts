import { type RoutePayload } from 'twenty-sdk/define';

// The route-only handlers read just the body of the payload the HTTP trigger passes.
export type SlackRouteBody = Pick<RoutePayload<unknown>, 'body'>;
