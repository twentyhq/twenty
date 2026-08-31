import { type RoutePayload } from 'twenty-sdk/define';

export type SlackRouteBody = Pick<RoutePayload<unknown>, 'body'>;
