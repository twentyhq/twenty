import {
  OBJECT_RECORD_CREATED_EVENT,
  ObjectRecordCreatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import {
  OBJECT_RECORD_DELETED_EVENT,
  ObjectRecordDeletedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/object-event/object-record-delete';
import {
  OBJECT_RECORD_UPDATED_EVENT,
  ObjectRecordUpdatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/object-event/object-record-updated';
import {
  CUSTOM_DOMAIN_ACTIVATED_EVENT,
  CustomDomainActivatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import {
  CUSTOM_DOMAIN_DEACTIVATED_EVENT,
  CustomDomainDeactivatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import {
  MONITORING_EVENT,
  MonitoringTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/monitoring/monitoring';
import {
  SERVERLESS_FUNCTION_EXECUTED_EVENT,
  ServerlessFunctionExecutedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/serverless-function/serverless-function-executed';
import {
  USER_SIGNUP_EVENT,
  UserSignupTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/user/user-signup';
import {
  WEBHOOK_RESPONSE_EVENT,
  WebhookResponseTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/webhook/webhook-response';
import {
  WORKSPACE_ENTITY_CREATED_EVENT,
  WorkspaceEntityCreatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/workspace-entity/workspace-entity-created';

// Define all track event names
export type TrackEventName =
  | typeof CUSTOM_DOMAIN_ACTIVATED_EVENT
  | typeof CUSTOM_DOMAIN_DEACTIVATED_EVENT
  | typeof SERVERLESS_FUNCTION_EXECUTED_EVENT
  | typeof WEBHOOK_RESPONSE_EVENT
  | typeof WORKSPACE_ENTITY_CREATED_EVENT
  | typeof MONITORING_EVENT
  | typeof OBJECT_RECORD_CREATED_EVENT
  | typeof OBJECT_RECORD_UPDATED_EVENT
  | typeof OBJECT_RECORD_DELETED_EVENT
  | typeof USER_SIGNUP_EVENT;

// Map event names to their corresponding event types
export interface TrackEvents {
  [CUSTOM_DOMAIN_ACTIVATED_EVENT]: CustomDomainActivatedTrackEvent;
  [CUSTOM_DOMAIN_DEACTIVATED_EVENT]: CustomDomainDeactivatedTrackEvent;
  [SERVERLESS_FUNCTION_EXECUTED_EVENT]: ServerlessFunctionExecutedTrackEvent;
  [WEBHOOK_RESPONSE_EVENT]: WebhookResponseTrackEvent;
  [WORKSPACE_ENTITY_CREATED_EVENT]: WorkspaceEntityCreatedTrackEvent;
  [USER_SIGNUP_EVENT]: UserSignupTrackEvent;
  [MONITORING_EVENT]: MonitoringTrackEvent;
  [OBJECT_RECORD_DELETED_EVENT]: ObjectRecordDeletedTrackEvent;
  [OBJECT_RECORD_CREATED_EVENT]: ObjectRecordCreatedTrackEvent;
  [OBJECT_RECORD_UPDATED_EVENT]: ObjectRecordUpdatedTrackEvent;
}

export type TrackEventProperties<T extends TrackEventName> =
  T extends keyof TrackEvents
    ? TrackEvents[T]['properties']
    : Record<string, unknown>;
