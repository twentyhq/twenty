// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/llms.txt
// WhatsAppApiEndpoints at the bottom maps every endpoint to its request and response types

type WhatsAppApiMessagingProduct = { messaging_product: 'whatsapp' };

type WhatsAppApiSuccessResponse = { success: boolean };

type WhatsAppApiPaging = {
  cursors: { before: string; after: string };
  previous?: string;
  next?: string;
};

type WhatsAppApiPagedResponse<TData> = {
  data: TData[];
  paging?: WhatsAppApiPaging;
};

type WhatsAppApiError = {
  code: number;
  title?: string;
  message: string;
};

// Messages
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages

type WhatsAppApiMediaSource = { id: string } | { link: string };

type WhatsAppApiContact = {
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: string;
  }>;
  birthday?: string;
  emails?: Array<{ email?: string; type?: string }>;
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
  };
  org?: { company?: string; department?: string; title?: string };
  phones?: Array<{ phone?: string; type?: string; wa_id?: string }>;
  urls?: Array<{ url?: string; type?: string }>;
};

type WhatsAppApiInteractiveBody = { body: { text: string } };

type WhatsAppApiInteractiveReplyButtons = WhatsAppApiInteractiveBody & {
  type: 'button';
  action: {
    buttons: Array<{
      type: 'reply';
      reply: { id: string; title: string }; // title max 20 characters
    }>;
  };
};

type WhatsAppApiInteractiveList = WhatsAppApiInteractiveBody & {
  type: 'list';
  action: {
    button: string;
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  };
};

type WhatsAppApiInteractiveLocationRequest = WhatsAppApiInteractiveBody & {
  type: 'location_request_message';
  action: { name: 'send_location' };
};

type WhatsAppApiInteractiveCtaUrl = WhatsAppApiInteractiveBody & {
  type: 'cta_url';
  action: {
    name: 'cta_url';
    parameters: { display_text: string; url: string };
  };
};

type WhatsAppApiInteractiveFlow = WhatsAppApiInteractiveBody & {
  type: 'flow';
  action: {
    name: 'flow';
    parameters: {
      flow_message_version: string;
      flow_id: string;
      flow_cta: string;
      flow_action: 'navigate' | 'data_exchange';
      flow_token?: string;
      flow_action_payload?: {
        screen: string;
        data?: Record<string, unknown>;
      };
    };
  };
};

type WhatsAppApiInteractiveVoiceCall = WhatsAppApiInteractiveBody & {
  type: 'voice_call';
  action: {
    name: 'voice_call';
    parameters: { display_text: string; ttl_minutes?: number };
  };
};

type WhatsAppApiInteractiveAddress = WhatsAppApiInteractiveBody & {
  type: 'address_message';
  action: {
    name: 'address_message';
    parameters: { country: string; values?: Record<string, string> };
  };
};

type WhatsAppApiInteractiveCarousel = WhatsAppApiInteractiveBody & {
  type: 'carousel';
  action: {
    // 2 to 10 cards
    cards: Array<{
      card_index: number;
      type: 'cta_url';
      header: { type: 'image'; image: { link: string } } | { type: 'video'; video: { link: string } };
      body?: { text: string };
      action: {
        name: 'cta_url';
        parameters: { display_text: string; url: string };
      };
    }>;
  };
};

type WhatsAppApiTemplateParameter =
  | { type: 'text'; text: string; parameter_name?: string } // parameter_name for named format only
  | { type: 'group_id'; group_id: string }; // group invite templates

type WhatsAppApiTemplateComponent = {
  type: string;
  sub_type?: string;
  index?: number;
  parameters?: WhatsAppApiTemplateParameter[];
};

type WhatsAppApiSendMessageBase = WhatsAppApiMessagingProduct & {
  recipient_type?: 'individual' | 'group';
  to: string; // phone number, or group ID for group messages
  context?: { message_id: string }; // reply to a message
};

export type WhatsAppApiSendMessageRequest = WhatsAppApiSendMessageBase &
  (
    | { type: 'text'; text: { body: string; preview_url?: boolean } }
    | { type: 'image'; image: WhatsAppApiMediaSource & { caption?: string } }
    | { type: 'audio'; audio: WhatsAppApiMediaSource }
    | { type: 'video'; video: WhatsAppApiMediaSource & { caption?: string } }
    | { type: 'document'; document: WhatsAppApiMediaSource & { caption?: string; filename?: string } }
    | { type: 'sticker'; sticker: WhatsAppApiMediaSource }
    | {
        type: 'location';
        location: { latitude: number; longitude: number; name?: string; address?: string };
      }
    | { type: 'contacts'; contacts: WhatsAppApiContact[] }
    | { type: 'reaction'; reaction: { message_id: string; emoji: string } }
    | {
        type: 'template';
        template: {
          name: string;
          language: { code: string };
          components?: WhatsAppApiTemplateComponent[];
        };
      }
    | {
        type: 'interactive';
        interactive:
          | WhatsAppApiInteractiveReplyButtons
          | WhatsAppApiInteractiveList
          | WhatsAppApiInteractiveLocationRequest
          | WhatsAppApiInteractiveCtaUrl
          | WhatsAppApiInteractiveFlow
          | WhatsAppApiInteractiveVoiceCall
          | WhatsAppApiInteractiveAddress
          | WhatsAppApiInteractiveCarousel;
      }
  );

export type WhatsAppApiSendMessageResponse = WhatsAppApiMessagingProduct & {
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{
    id: string; // appears in status webhooks
    group_id?: string; // group messages only
    message_status?: string; // paced template messages only
  }>;
};

export type WhatsAppApiMarkAsReadRequest = WhatsAppApiMessagingProduct & {
  status: 'read';
  message_id: string;
  typing_indicator?: { type: 'text' };
};

// Media
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media

// multipart/form-data
export type WhatsAppApiUploadMediaRequest = WhatsAppApiMessagingProduct & {
  file: string;
  type: string; // mime type
};

export type WhatsAppApiUploadMediaResponse = { id: string };

export type WhatsAppApiMediaQuery = { phone_number_id?: string };

export type WhatsAppApiGetMediaResponse = WhatsAppApiMessagingProduct & {
  id: string;
  url: string; // valid for 5 minutes, download with the bearer token
  mime_type: string;
  sha256: string;
  file_size: string;
};

// Groups
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference

export type WhatsAppApiCreateGroupRequest = WhatsAppApiMessagingProduct & {
  subject: string; // max 128 characters
  description?: string; // max 2048 characters
  join_approval_mode?: 'approval_required' | 'auto_approve';
};

// the invite link arrives through a webhook
export type WhatsAppApiCreateGroupResponse = WhatsAppApiMessagingProduct & {
  request_id?: string;
};

export type WhatsAppApiGetGroupsQuery = {
  limit?: number; // default 25, max 1024
  after?: string;
  before?: string;
};

export type WhatsAppApiGetGroupsResponse = {
  data: { groups: Array<{ id: string; subject: string; created_at: string }> };
  paging: WhatsAppApiPaging;
};

export type WhatsAppApiGetGroupQuery = {
  fields?: string; // subject,description,participants,join_approval_mode,suspended,creation_timestamp,total_participant_count
};

export type WhatsAppApiGetGroupResponse = WhatsAppApiMessagingProduct & {
  id: string;
  subject?: string;
  description?: string;
  creation_timestamp?: number;
  suspended?: boolean;
  total_participant_count?: number;
  participants?: Array<{ wa_id: string }>;
  join_approval_mode?: string;
};

export type WhatsAppApiUpdateGroupRequest = WhatsAppApiMessagingProduct & {
  subject?: string;
  description?: string;
  profile_picture_file?: string; // JPEG, max 5MB, square
};

export type WhatsAppApiGetGroupJoinRequestsResponse = WhatsAppApiPagedResponse<{
  join_request_id: string;
  wa_id: string;
  creation_timestamp: number;
}>;

export type WhatsAppApiGroupJoinRequestsRequest = WhatsAppApiMessagingProduct & {
  join_requests: string[];
};

type WhatsAppApiFailedJoinRequest = {
  join_request_id: string;
  errors: WhatsAppApiError[];
};

export type WhatsAppApiApproveGroupJoinRequestsResponse = WhatsAppApiMessagingProduct & {
  approved_join_requests: string[];
  failed_join_requests?: WhatsAppApiFailedJoinRequest[];
  errors?: WhatsAppApiError[];
};

export type WhatsAppApiRejectGroupJoinRequestsResponse = WhatsAppApiMessagingProduct & {
  rejected_join_requests: string[];
  failed_join_requests?: WhatsAppApiFailedJoinRequest[];
  errors?: WhatsAppApiError[];
};

export type WhatsAppApiGroupInviteLinkResponse = WhatsAppApiMessagingProduct & {
  invite_link: string; // https://chat.whatsapp.com/<LINK_ID>
};

export type WhatsAppApiRemoveGroupParticipantsRequest = WhatsAppApiMessagingProduct & {
  participants: Array<{ user: string }>; // max 8
};

// Calling
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/reference

type WhatsAppApiCallSession<TSdpType extends 'offer' | 'answer'> = {
  sdp_type: TSdpType;
  sdp: string;
};

type WhatsAppApiCallingWeekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type WhatsAppApiCallingSettings = {
  calling?: {
    status?: 'ENABLED' | 'DISABLED';
    call_icon_visibility?: 'DEFAULT' | 'DISABLE ALL';
    call_hours?: {
      status: 'ENABLED' | 'DISABLED';
      timezone_id: string;
      weekly_operating_hours: Array<{
        day_of_week: WhatsAppApiCallingWeekday;
        open_time: string; // HHMM
        close_time: string; // HHMM
      }>;
      holiday_schedule?: Array<{
        date: string; // YYYY-MM-DD
        start_time: string;
        end_time: string;
      }>;
    };
    callback_permission_status?: 'ENABLED' | 'DISABLED';
    sip?: {
      status?: 'ENABLED' | 'DISABLED';
      servers?: Array<{
        hostname: string;
        port: number;
        request_uri_user_params?: Record<string, string>;
      }>;
    };
  };
};

export type WhatsAppApiGetCallingSettingsQuery = { include_sip_credentials?: boolean };

export type WhatsAppApiCallRequest = WhatsAppApiMessagingProduct &
  (
    | {
        action: 'pre_accept';
        call_id: string;
        session?: WhatsAppApiCallSession<'answer'>;
      }
    | {
        action: 'accept';
        call_id: string;
        session?: WhatsAppApiCallSession<'answer'>;
        biz_opaque_callback_data?: string; // max 512 characters
      }
    | { action: 'reject'; call_id: string }
    | { action: 'terminate'; call_id: string }
    | {
        action: 'connect';
        to?: string; // phone number
        recipient?: string; // BSUID or parent BSUID
        session: WhatsAppApiCallSession<'offer'>;
        biz_opaque_callback_data?: string; // max 512 characters
      }
  );

export type WhatsAppApiCallResponse =
  | (WhatsAppApiMessagingProduct & { success: boolean }) // pre_accept, accept, reject, terminate
  | (WhatsAppApiMessagingProduct & { calls: Array<{ id: string }> }); // connect

export type WhatsAppApiGetCallPermissionsQuery = {
  user_wa_id?: string;
  recipient?: string; // BSUID
};

export type WhatsAppApiGetCallPermissionsResponse = WhatsAppApiMessagingProduct & {
  permission: {
    status: 'no_permission' | 'temporary';
    expiration_time?: number;
  };
  actions: Array<{
    action_name: 'send_call_permission_request' | 'start_call';
    can_perform_action: boolean;
    limits: Array<{
      time_period: string; // ISO 8601 duration, e.g. PT24H
      max_allowed: number;
      current_usage: number;
      limit_expiration_time?: number;
    }>;
  }>;
};

// Phone numbers
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers

export type WhatsAppApiPhoneNumber = {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'NA' | 'UNKNOWN';
};

export type WhatsAppApiGetPhoneNumbersQuery = { limit?: number; after?: string };

export type WhatsAppApiGetPhoneNumbersResponse = WhatsAppApiPagedResponse<WhatsAppApiPhoneNumber>;

export type WhatsAppApiGetPhoneNumberQuery = { fields?: string };

export type WhatsAppApiGetPhoneNumberResponse = WhatsAppApiPhoneNumber & {
  code_verification_status?: 'VERIFIED' | 'NOT_VERIFIED';
  status?: 'CONNECTED' | 'DISCONNECTED' | 'NEWLY_CREATED';
  throughput?: string;
  name_status?:
    | 'APPROVED'
    | 'AVAILABLE_WITHOUT_REVIEW'
    | 'DECLINED'
    | 'EXPIRED'
    | 'PENDING_REVIEW'
    | 'NONE';
};

export type WhatsAppApiRequestVerificationCodeRequest = {
  code_method: 'SMS' | 'VOICE';
  language: string; // e.g. en_US
};

export type WhatsAppApiVerifyCodeRequest = { code: string };

export type WhatsAppApiUpdateIdentityCheckSettingsRequest = {
  user_identity_change: { enable_identity_key_check: boolean };
};

// Business profile
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/business-profiles

export type WhatsAppApiBusinessProfile = WhatsAppApiMessagingProduct & {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  profile_picture_url?: string;
  websites?: string[];
  vertical?: string;
};

export type WhatsAppApiGetBusinessProfileQuery = {
  fields?: string; // about,address,description,email,profile_picture_url,websites,vertical
};

export type WhatsAppApiGetBusinessProfileResponse = { data: WhatsAppApiBusinessProfile[] };

export type WhatsAppApiUpdateBusinessProfileRequest = WhatsAppApiMessagingProduct & {
  about?: string; // 1-139 characters
  address?: string; // max 256 characters
  description?: string; // max 512 characters
  email?: string; // max 128 characters
  vertical?: string;
  websites?: string[]; // max 2, 256 characters each
  profile_picture_handle?: string;
};

// Templates
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview

type WhatsAppApiTemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';

type WhatsAppApiTemplateDefinitionComponent = {
  type: string;
  format?: string;
  text?: string;
  // required by Meta for every parameter used in text
  example?: {
    body_text?: string[][]; // positional format, one inner array of examples
    body_text_named_params?: Array<{ param_name: string; example: string }>;
    header_text?: string[];
    header_text_named_params?: Array<{ param_name: string; example: string }>;
  };
};

export type WhatsAppApiCreateTemplateRequest = {
  name: string;
  category: WhatsAppApiTemplateCategory;
  language: string;
  parameter_format?: 'positional' | 'named';
  components: WhatsAppApiTemplateDefinitionComponent[];
};

export type WhatsAppApiCreateTemplateResponse = {
  id: string;
  status: string;
  category?: WhatsAppApiTemplateCategory;
};

export type WhatsAppApiGetTemplatesQuery = {
  fields?: string;
  limit?: number;
  status?: 'approved' | 'rejected';
};

export type WhatsAppApiTemplate = {
  id: string;
  name: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  category: WhatsAppApiTemplateCategory;
  language: string;
  components?: WhatsAppApiTemplateDefinitionComponent[];
};

export type WhatsAppApiGetTemplatesResponse = WhatsAppApiPagedResponse<WhatsAppApiTemplate>;

export type WhatsAppApiGetTemplateQuery = { fields?: string };

export type WhatsAppApiGetTemplateResponse = Partial<WhatsAppApiTemplate> & { id: string };

export type WhatsAppApiEditTemplateRequest = {
  category?: WhatsAppApiTemplateCategory;
  components?: WhatsAppApiTemplateDefinitionComponent[];
};

// delete by name, by name + hsm_id, or in bulk with hsm_ids (up to 100)
export type WhatsAppApiDeleteTemplatesQuery =
  | { name: string; hsm_id?: string }
  | { hsm_ids: string[] };

// Endpoint map
// keys are "<METHOD> <path>", with the API version prefix omitted

type WhatsAppApiEndpoint<TRequest, TResponse, TQuery = undefined> = {
  query: TQuery;
  request: TRequest;
  response: TResponse;
};

export type WhatsAppApiEndpoints = {
  // messages
  'POST /{phoneNumberId}/messages': WhatsAppApiEndpoint<
    WhatsAppApiSendMessageRequest | WhatsAppApiMarkAsReadRequest,
    WhatsAppApiSendMessageResponse | WhatsAppApiSuccessResponse // mark as read returns success
  >;

  // media
  'POST /{phoneNumberId}/media': WhatsAppApiEndpoint<
    WhatsAppApiUploadMediaRequest,
    WhatsAppApiUploadMediaResponse
  >;
  'GET /{mediaId}': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetMediaResponse,
    WhatsAppApiMediaQuery
  >;
  'DELETE /{mediaId}': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiSuccessResponse,
    WhatsAppApiMediaQuery
  >;

  // groups
  'POST /{phoneNumberId}/groups': WhatsAppApiEndpoint<
    WhatsAppApiCreateGroupRequest,
    WhatsAppApiCreateGroupResponse
  >;
  'GET /{phoneNumberId}/groups': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetGroupsResponse,
    WhatsAppApiGetGroupsQuery
  >;
  'GET /{groupId}': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetGroupResponse,
    WhatsAppApiGetGroupQuery
  >;
  'POST /{groupId}': WhatsAppApiEndpoint<
    WhatsAppApiUpdateGroupRequest,
    WhatsAppApiSuccessResponse
  >;
  'DELETE /{groupId}': WhatsAppApiEndpoint<undefined, WhatsAppApiSuccessResponse>;
  'GET /{groupId}/join_requests': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetGroupJoinRequestsResponse
  >;
  'POST /{groupId}/join_requests': WhatsAppApiEndpoint<
    WhatsAppApiGroupJoinRequestsRequest,
    WhatsAppApiApproveGroupJoinRequestsResponse
  >;
  'DELETE /{groupId}/join_requests': WhatsAppApiEndpoint<
    WhatsAppApiGroupJoinRequestsRequest,
    WhatsAppApiRejectGroupJoinRequestsResponse
  >;
  'GET /{groupId}/invite_link': WhatsAppApiEndpoint<undefined, WhatsAppApiGroupInviteLinkResponse>;
  'POST /{groupId}/invite_link': WhatsAppApiEndpoint<
    WhatsAppApiMessagingProduct,
    WhatsAppApiGroupInviteLinkResponse
  >;
  'DELETE /{groupId}/participants': WhatsAppApiEndpoint<
    WhatsAppApiRemoveGroupParticipantsRequest,
    WhatsAppApiSuccessResponse
  >;

  // calling
  'GET /{phoneNumberId}/settings': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiCallingSettings,
    WhatsAppApiGetCallingSettingsQuery
  >;
  'POST /{phoneNumberId}/settings': WhatsAppApiEndpoint<
    WhatsAppApiCallingSettings | WhatsAppApiUpdateIdentityCheckSettingsRequest,
    WhatsAppApiSuccessResponse
  >;
  'POST /{phoneNumberId}/calls': WhatsAppApiEndpoint<
    WhatsAppApiCallRequest,
    WhatsAppApiCallResponse
  >;
  'GET /{phoneNumberId}/call_permissions': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetCallPermissionsResponse,
    WhatsAppApiGetCallPermissionsQuery
  >;

  // phone numbers
  'GET /{wabaId}/phone_numbers': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetPhoneNumbersResponse,
    WhatsAppApiGetPhoneNumbersQuery
  >;
  'GET /{phoneNumberId}': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetPhoneNumberResponse,
    WhatsAppApiGetPhoneNumberQuery
  >;
  'POST /{phoneNumberId}/request_code': WhatsAppApiEndpoint<
    WhatsAppApiRequestVerificationCodeRequest,
    Partial<WhatsAppApiSuccessResponse>
  >;
  'POST /{phoneNumberId}/verify_code': WhatsAppApiEndpoint<
    WhatsAppApiVerifyCodeRequest,
    WhatsAppApiSuccessResponse
  >;

  // business profile
  'GET /{phoneNumberId}/whatsapp_business_profile': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetBusinessProfileResponse,
    WhatsAppApiGetBusinessProfileQuery
  >;
  'POST /{phoneNumberId}/whatsapp_business_profile': WhatsAppApiEndpoint<
    WhatsAppApiUpdateBusinessProfileRequest,
    WhatsAppApiSuccessResponse
  >;

  // templates
  'POST /{wabaId}/message_templates': WhatsAppApiEndpoint<
    WhatsAppApiCreateTemplateRequest,
    WhatsAppApiCreateTemplateResponse
  >;
  'GET /{wabaId}/message_templates': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetTemplatesResponse,
    WhatsAppApiGetTemplatesQuery
  >;
  'DELETE /{wabaId}/message_templates': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiSuccessResponse,
    WhatsAppApiDeleteTemplatesQuery
  >;
  'GET /{templateId}': WhatsAppApiEndpoint<
    undefined,
    WhatsAppApiGetTemplateResponse,
    WhatsAppApiGetTemplateQuery
  >;
  'POST /{templateId}': WhatsAppApiEndpoint<
    WhatsAppApiEditTemplateRequest,
    WhatsAppApiSuccessResponse
  >;
};
