// Runtime-facing barrel for logic-function authors.
//
// Anything imported from this entry point is allowed to reach the Lambda
// runtime. Today we only re-export type-only payload shapes; all of these
// disappear at TS compile time so the compiled bundle is empty.
//
// `defineLogicFunction`, `definePostInstallLogicFunction`, etc. intentionally
// stay in `twenty-sdk/define` — they are build-time metadata factories that
// the SDK CLI stubs out before bundling. Logic-function source files keep
// importing them from `twenty-sdk/define`, but should reach for *types* (and
// future runtime helpers) here, never directly from `twenty-shared/*`.

export type {
  LogicFunctionConfig,
  LogicFunctionHandler,
} from '@/sdk/define/logic-functions/logic-function-config';

export type {
  InstallHandler,
  InstallPayload,
} from '@/sdk/define/logic-functions/install-payload-type';

export type { CronPayload } from '@/sdk/define/logic-functions/triggers/cron-payload-type';

export type {
  DatabaseEventPayload,
  ObjectRecordBaseEvent,
  ObjectRecordCreateEvent,
  ObjectRecordDeleteEvent,
  ObjectRecordDestroyEvent,
  ObjectRecordEvent,
  ObjectRecordRestoreEvent,
  ObjectRecordUpdateEvent,
  ObjectRecordUpsertEvent,
} from '@/sdk/define/logic-functions/triggers/database-event-payload-type';

export type { RoutePayload } from '@/sdk/define/logic-functions/triggers/route-payload-type';

export type { InputJsonSchema } from 'twenty-shared/logic-function';

export { getConnection } from '@/sdk/logic-function/connections/get-connection';
export { listConnections } from '@/sdk/logic-function/connections/list-connections';
export type { ListConnectionsFilter } from '@/sdk/logic-function/connections/list-connections';
export { findConnectionForRequest } from '@/sdk/logic-function/connections/find-connection-for-request';
export { AppConnectionAuthFailedError } from '@/sdk/logic-function/connections/errors/app-connection-auth-failed.error';
export type { AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
