import {
  type OBJECT_RECORD_CREATED_EVENT,
  type ObjectRecordCreatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import {
  type OBJECT_RECORD_DELETED_EVENT,
  type ObjectRecordDeletedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/object-event/object-record-delete';
import {
  type OBJECT_RECORD_UPDATED_EVENT,
  type ObjectRecordUpdatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/object-event/object-record-updated';
import {
  type OBJECT_RECORD_UPSERTED_EVENT,
  type ObjectRecordUpsertedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/object-event/object-record-upserted';
import {
  type CUSTOM_DOMAIN_ACTIVATED_EVENT,
  type CustomDomainActivatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import {
  type CUSTOM_DOMAIN_DEACTIVATED_EVENT,
  type CustomDomainDeactivatedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import {
  type MONITORING_EVENT,
  type MonitoringTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/monitoring/monitoring';
import {
  type SERVERLESS_FUNCTION_EXECUTED_EVENT,
  type ServerlessFunctionExecutedTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/serverless-function/serverless-function-executed';
import {
  type USER_SIGNUP_EVENT,
  type UserSignupTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/user/user-signup';
import {
  type WEBHOOK_RESPONSE_EVENT,
  type WebhookResponseTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/webhook/webhook-response';
import {
  type WORKSPACE_ENTITY_CREATED_EVENT,
  type WorkspaceEntityCreatedTrackEvent,
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
  | typeof OBJECT_RECORD_UPSERTED_EVENT
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
  [OBJECT_RECORD_UPSERTED_EVENT]: ObjectRecordUpsertedTrackEvent;
}

export type TrackEventProperties<T extends TrackEventName> =
  T extends keyof TrackEvents
    ? TrackEvents[T]['properties']
    : Record<string, unknown>;
