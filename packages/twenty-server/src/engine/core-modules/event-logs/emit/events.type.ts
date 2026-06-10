import {
  type OBJECT_RECORD_CREATED_EVENT,
  type ObjectRecordCreatedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-created';
import {
  type OBJECT_RECORD_DELETED_EVENT,
  type ObjectRecordDeletedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-delete';
import {
  type OBJECT_RECORD_UPDATED_EVENT,
  type ObjectRecordUpdatedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-updated';
import {
  type OBJECT_RECORD_UPSERTED_EVENT,
  type ObjectRecordUpsertedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-upserted';
import {
  type CUSTOM_DOMAIN_ACTIVATED_EVENT,
  type CustomDomainActivatedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/custom-domain/custom-domain-activated';
import {
  type CUSTOM_DOMAIN_DEACTIVATED_EVENT,
  type CustomDomainDeactivatedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/custom-domain/custom-domain-deactivated';
import {
  type LOGIC_FUNCTION_EXECUTED_EVENT,
  type LogicFunctionExecutedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/logic-function/logic-function-executed';
import {
  type IMPERSONATION_EVENT,
  type ImpersonationTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/impersonation/impersonation';
import {
  type SERVER_ADMIN_ACCESS_CHANGED_EVENT,
  type ServerAdminAccessChangedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/server-admin/server-admin-access-changed';
import {
  type USER_SIGNUP_EVENT,
  type UserSignupTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/user/user-signup';
import {
  type WEBHOOK_RESPONSE_EVENT,
  type WebhookResponseTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/webhook/webhook-response';
import {
  type PAYMENT_RECEIVED_EVENT,
  type PaymentReceivedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/billing/payment-received';
import {
  type WORKSPACE_CREATED_EVENT,
  type WorkspaceCreatedTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/workspace/workspace-created';

export type TrackEventName =
  | typeof CUSTOM_DOMAIN_ACTIVATED_EVENT
  | typeof CUSTOM_DOMAIN_DEACTIVATED_EVENT
  | typeof LOGIC_FUNCTION_EXECUTED_EVENT
  | typeof WEBHOOK_RESPONSE_EVENT
  | typeof IMPERSONATION_EVENT
  | typeof OBJECT_RECORD_CREATED_EVENT
  | typeof OBJECT_RECORD_UPDATED_EVENT
  | typeof OBJECT_RECORD_DELETED_EVENT
  | typeof OBJECT_RECORD_UPSERTED_EVENT
  | typeof USER_SIGNUP_EVENT
  | typeof WORKSPACE_CREATED_EVENT
  | typeof PAYMENT_RECEIVED_EVENT
  | typeof SERVER_ADMIN_ACCESS_CHANGED_EVENT;

export interface TrackEvents {
  [CUSTOM_DOMAIN_ACTIVATED_EVENT]: CustomDomainActivatedTrackEvent;
  [CUSTOM_DOMAIN_DEACTIVATED_EVENT]: CustomDomainDeactivatedTrackEvent;
  [LOGIC_FUNCTION_EXECUTED_EVENT]: LogicFunctionExecutedTrackEvent;
  [WEBHOOK_RESPONSE_EVENT]: WebhookResponseTrackEvent;
  [USER_SIGNUP_EVENT]: UserSignupTrackEvent;
  [IMPERSONATION_EVENT]: ImpersonationTrackEvent;
  [OBJECT_RECORD_DELETED_EVENT]: ObjectRecordDeletedTrackEvent;
  [OBJECT_RECORD_CREATED_EVENT]: ObjectRecordCreatedTrackEvent;
  [OBJECT_RECORD_UPDATED_EVENT]: ObjectRecordUpdatedTrackEvent;
  [OBJECT_RECORD_UPSERTED_EVENT]: ObjectRecordUpsertedTrackEvent;
  [WORKSPACE_CREATED_EVENT]: WorkspaceCreatedTrackEvent;
  [PAYMENT_RECEIVED_EVENT]: PaymentReceivedTrackEvent;
  [SERVER_ADMIN_ACCESS_CHANGED_EVENT]: ServerAdminAccessChangedTrackEvent;
}

export type TrackEventProperties<T extends TrackEventName> =
  T extends keyof TrackEvents
    ? TrackEvents[T]['properties']
    : Record<string, unknown>;
