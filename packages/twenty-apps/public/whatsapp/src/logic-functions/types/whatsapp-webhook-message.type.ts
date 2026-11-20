// most message types are supported except for unsupported as they don't have any customer data
// reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text#text-message

export type WhatsAppWebhookMessage = {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<WhatsAppWebhookMessagesChange>;
  }>;
};

type WhatsAppWebhookMessagesValue = WhatsAppWebhookMessagingValue &
  (WhatsappWebhookMessageErrors | WhatsappWebhookMessageStatuses | WhatsappWebhookMessageMessages);

type WhatsAppWebhookMessagesChange = WhatsAppWebhookChangeOf<'messages', WhatsAppWebhookMessagesValue>;

export type WhatsappWebhookMessageBusinessData = {
  display_phone_number: string; // business phone number
  phone_number_id: string; // business phone number ID
}

type WhatsappWebhookMessageErrors = {
  // only 1 element https://stackoverflow.com/a/79564754
  errors: Array<{
    // reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/errors
    code: number;
    title: string;
    message: string;
    error_data: {
      details: string;
    };
    href: string;
  }>;
}

type WhatsappWebhookMessageStatuses = {
  // only 1 element
  statuses: Array<{
    id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    recipient_id: string;
  }>;
}

// https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids
export type WhatsAppWebhookMessageContacts = {
  profile: {
    name: string;
  };
  wa_id?: string; // phone number, omitted when a username hides it
  user_id?: string; // business-scoped user ID (BSUID)
  username?: string;
  identity_key_hash?: string; // audio/button/document message
};

type WhatsappWebhookMessageMessages = {
  // only 1 element, absent for system messages
  contacts?: WhatsAppWebhookMessageContacts[];
  // only 1 element
  messages: WhatsAppWebhookMessageContent[];
};

type WhatsAppWebhookMessageBase = {
  from?: string; // phone number, omitted when a username hides it
  from_user_id?: string; // business-scoped user ID (BSUID)
  group_id?: string; // only for group messages
  id: string; // WhatsApp message ID
  timestamp: string;
}

type MediaPayload = {
  mime_type: string;
  sha256: string;
  id: string;
  url?: string; // gradually rolling out, download by id instead
}

type ImagePayload = MediaPayload & { caption?: string };

type WhatsAppWebhookMessageReferral = {
  referral?: {
    // included if message was sent via ad https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/audio#syntax
    source_url: string;
    source_id: string;
    source_type: 'ad';
    body: string;
    headline: string;
    media_type: string;
    image_url: string;
    video_url: string;
    thumbnail_url: string;
    ctwa_clid: string;
    welcome_message: {
      text: string;
    };
  }
};

type AudioMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral &{
  type: 'audio';
  audio: MediaPayload & { voice: boolean };
}

type ButtonMessage = WhatsAppWebhookMessageBase & {
  type: 'button';
  button: {
    payload: string;
    text: string;
  }
}

type ContactsMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral & {
  type: 'contacts';
  contacts?: Array<{
    // many properties are optional => https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/contacts#syntax
    addresses?: Array<{
      city?: string;
      country?: string;
      country_code?: string;
      state?: string;
      street?: string;
      type?: string;
      zip?: string;
    }>;
    birthday?: string;
    emails?: Array<{
      email?: string;
      type?: string;
    }>;
    name?: {
      formatted_name?: string;
      first_name?: string;
      last_name?: string;
      middle_name?: string;
      suffix?: string;
      prefix?: string;
    };
    org: {
      company?: string;
      department?: string;
      title?: string;
    };
    phones?: Array<{
      phone?: string;
      wa_id?: string;
      type?: string;
    }>;
    urls?: Array<{
      url?: string;
      type?: string;
    }>;
  }>;
}

type DocumentMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral & {
  type: 'document';
  document: ImagePayload & { filename?: string };
}

type EditMessage = WhatsAppWebhookMessageBase & {
  type: 'edit';
  edit: { // added 11 July https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/edit
    original_message_id: string;
    message: { context?: { id: string } } & (
      | { type: 'text'; text: { body: string } }
      | { type: 'image'; image: ImagePayload }
      | { type: 'video'; video: ImagePayload }
      | { type: 'document'; document: ImagePayload & { filename?: string } }
    );
  }
}

type ImageMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral & {
  type: 'image';
  image: ImagePayload;
}

type InteractiveMessage = WhatsAppWebhookMessageBase & {
  type: 'interactive';
  interactive:
    | {
    type: 'list_reply';
    list_reply: {
      id: string;
      title: string;
      description?: string;
    };
  }
    | {
    type: 'button_reply';
    button_reply: {
      id: string;
      title: string;
    };
  }
    | {
    // flow and address message replies
    type: 'nfm_reply';
    nfm_reply: {
      name?: string;
      body?: string;
      response_json: string;
    };
  }
}

type LocationMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral & {
  type: 'location';
  location: {
    address?: string;
    latitude: number;
    longitude: number;
    name?: string;
    url?: string;
  };
}

type OrderMessage = WhatsAppWebhookMessageBase & {
  type: 'order';
  order: {
    catalog_id: string;
    text: string;
    product_items: Array<{
      product_retailer_id: string;
      quantity: number;
      item_price: number;
      currency: string;
    }>;
  };
}

type ReactionMessage = WhatsAppWebhookMessageBase & {
  type: 'reaction';
  reaction: {
    message_id: string;
    emoji?: string; // unicode
  };
}

type RevokeMessage = WhatsAppWebhookMessageBase & {
  type: 'revoke';
  revoke: {
    original_message_id: string;
  }
}

type StickerMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral & {
  type: 'sticker';
  sticker: MediaPayload & { animated: boolean };
}

type SystemMessage = WhatsAppWebhookMessageBase & {
  type: 'system';
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/system
  system: {
    body: string;
    wa_id?: string; // new phone number, only for user_changed_number
    type: 'user_changed_number' | 'user_changed_user_id';
    user_id?: string;
    previous_user_id?: string;
  };
}

type TextMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral & {
  type: 'text';
  text: {
    body: string;
  }
}

type UnsupportedMessage = WhatsAppWebhookMessageBase & {
  type: 'unsupported';
}

type VideoMessage = WhatsAppWebhookMessageBase & WhatsAppWebhookMessageReferral & {
  type: 'video';
  video: ImagePayload;
}

export type WhatsAppWebhookMessageContent =
  | AudioMessage
  | ButtonMessage
  | ContactsMessage
  | DocumentMessage
  | EditMessage
  | ImageMessage
  | InteractiveMessage
  | LocationMessage
  | OrderMessage
  | ReactionMessage
  | RevokeMessage
  | StickerMessage
  | SystemMessage
  | TextMessage
  | UnsupportedMessage
  | VideoMessage;

type WhatsAppWebhookChangeOf<TField extends string, TValue> = {
  field: TField;
  value: TValue;
};

type WhatsAppWebhookMessagingValue = {
  messaging_product: 'whatsapp';
  metadata: WhatsappWebhookMessageBusinessData;
};

type WhatsAppTemplateIdentity = {
  message_template_id: number;
  message_template_name: string;
  message_template_language: string;
};

type WhatsAppTier =
  | 'TIER_50'
  | 'TIER_250'
  | 'TIER_2K'
  | 'TIER_10K'
  | 'TIER_100K'
  | 'TIER_NOT_SET'
  | 'TIER_UNLIMITED';

export type WhatsAppAccountAlertsValue = {
  entity_type: 'BUSINESS' | 'PHONE_NUMBER' | 'CURRENT_STATUS_ID';
  entity_id: string;
  alert_info: {
    alert_severity: 'CRITICAL' | 'INFORMATIONAL' | 'WARNING';
    alert_status: 'ACTIVE' | 'NONE';
    alert_type:
      | 'INCREASED_CAPABILITIES_ELIGIBILITY_DEFERRED'
      | 'INCREASED_CAPABILITIES_ELIGIBILITY_FAILED'
      | 'INCREASED_CAPABILITIES_ELIGIBILITY_NEED_MORE_INFO'
      | 'OBA_APPROVED'
      | 'OBA_REJECTED'
      | 'PROFILE_PICTURE_LOST';
    alert_description: string;
  };
};

type WhatsAppAccountReviewUpdateValue = {
  decision: 'APPROVED' | 'REJECTED' | 'PENDING' | 'DEFERRED';
};

type WhatsAppWabaInfo = {
  waba_id: string;
  owner_business_id: string;
};

export type WhatsAppAccountUpdateValue =
  | { event: 'ACCOUNT_DELETED' }
  | { event: 'ACCOUNT_OFFBOARDED' }
  | { event: 'ACCOUNT_RECONNECTED' }
  | {
      event: 'ACCOUNT_RESTRICTION';
      restriction_info: Array<{
        restriction_type:
          | 'RESTRICTED_ADD_PHONE_NUMBER_ACTION'
          | 'RESTRICTED_BIZ_INITIATED_AND_USER_INITIATED_CALLING'
          | 'RESTRICTED_BIZ_INITIATED_MESSAGING'
          | 'RESTRICTED_BUSINESS_INITIATED_CALLING'
          | 'RESTRICTED_CUSTOMER_INITIATED_MESSAGING'
          | 'RESTRICTED_DIRECT_SEND_UTILITY_TEMPLATES'
          | 'RESTRICTED_USER_INITIATED_CALLING'
          | 'RESTRICTED_USER_INITIATED_CALLING_CALL_BUTTON_HIDDEN'
          | 'RESTRICTED_UTILITY_TEMPLATES';
        expiration: number;
        remediation?: string;
      }>;
    }
  | {
      event: 'ACCOUNT_VIOLATION';
      violation_info: { violation_type: string };
    }
  | {
      event: 'AD_ACCOUNT_LINKED';
      waba_info: {
        waba_id: string;
        ad_account_linked: string;
        owner_business_id: string;
      };
    }
  | {
      event: 'AUTH_INTL_PRICE_ELIGIBILITY_UPDATE';
      auth_international_rate_eligibility: {
        start_time: number;
        exception_countries?: Array<{
          country_code: string;
          start_time: number;
        }>;
      };
    }
  | {
      event: 'BUSINESS_PRIMARY_LOCATION_COUNTRY_UPDATE';
      country: string;
    }
  | {
      event: 'DISABLED_UPDATE';
      ban_info: {
        waba_ban_state: 'DISABLE' | 'REINSTATE' | 'SCHEDULE_FOR_DISABLE';
        waba_ban_date: string;
      };
    }
  | {
      event: 'MM_LITE_TERMS_SIGNED';
      waba_info: WhatsAppWabaInfo;
    }
  | {
      event: 'PARTNER_ADDED';
      waba_info: WhatsAppWabaInfo & {
        solution_id?: string;
        solution_partner_business_ids?: string[];
      };
    }
  | {
      event: 'PARTNER_APP_INSTALLED';
      waba_info: WhatsAppWabaInfo & {
        partner_app_id: string;
        solution_id?: string;
        solution_partner_business_ids?: string[];
      };
    }
  | {
      event: 'PARTNER_APP_UNINSTALLED';
      waba_info: WhatsAppWabaInfo & { partner_app_id: string };
    }
  | {
      event: 'PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE';
      partner_client_certification_info: {
        client_business_id: string;
        status: 'APPROVED' | 'DISCARDED' | 'FAILED' | 'PENDING' | 'REVOKED';
        rejection_reasons?: Array<
          | 'ADDRESS NOT MATCHING'
          | 'BUSINESS NOT ELIGIBLE'
          | 'LEGAL NAME NOT MATCHING'
          | 'LEGAL NAME NOT FOUND IN DOCUMENTS'
          | 'MALFORMED DOCUMENTS'
          | 'NONE'
          | 'WEBSITE NOT MATCHING'
        >;
      };
    }
  | {
      event: 'PARTNER_REMOVED';
      waba_info: WhatsAppWabaInfo;
      disconnection_info?: {
        reason:
          | 'ACCOUNT_DISCONNECTED'
          | 'BUSINESS_DOWNGRADE'
          | 'CHANGE_NUMBER'
          | 'COMPANION_INACTIVITY'
          | 'PRIMARY_INACTIVITY'
          | 'USER_RE_REGISTERED';
        initiated_by: 'SYSTEM' | 'USER';
      };
    }
  | {
      event: 'VOLUME_BASED_PRICING_TIER_UPDATE';
      volume_tier_info: {
        tier_update_time: number;
        pricing_category: string;
        tier: string;
        effective_month: string;
        region: string;
      };
    };

export type WhatsAppAutomaticEventsValue = WhatsAppWebhookMessagingValue & {
  automatic_events: Array<{
    id: string; // WhatsApp message ID
    event_name: 'LeadSubmitted' | 'Purchase';
    timestamp: number;
    ctwa_clid?: string; // not set for status ads
    custom_data?: {
      // purchase events only
      currency: string;
      value: number; // amount * 1000
    };
  }>;
};

export type WhatsAppBusinessCapabilityUpdateValue = {
  max_daily_conversation_per_phone?: number; // deprecated
  max_daily_conversations_per_business?:
    | 'TIER_250'
    | 'TIER_2K'
    | 'TIER_10K'
    | 'TIER_100K'
    | 'TIER_UNLIMITED';
  max_phone_numbers_per_business?: number;
  max_phone_numbers_per_waba?: number;
};

export type WhatsAppHistoryValue = WhatsAppWebhookMessagingValue & {
  history: Array<
    | {
        metadata: {
          phase: 0 | 1 | 2;
          chunk_order: number;
          progress: number; // 0-100
        };
        threads: Array<{
          id?: string; // customer phone number, omitted if unavailable
          context?: { wa_id?: string; user_id?: string };
          messages: Array<
            WhatsAppWebhookMessageContent & {
              to?: string; // only for SMB message echoes
              history_context: {
                status: 'DELIVERED' | 'ERROR' | 'PENDING' | 'PLAYED' | 'READ' | 'SENT';
              };
            }
          >;
        }>;
      }
    | {
        errors: Array<{
          code: number;
          title: string;
          message: string;
          error_data: { details: string };
        }>;
      }
  >;
};

export type WhatsAppMessageTemplateComponentsUpdateValue = WhatsAppTemplateIdentity & {
  message_template_element: string;
  message_template_title?: string;
  message_template_footer?: string;
  message_template_buttons?: Array<{
    message_template_button_type:
      | 'CATALOG'
      | 'COPY_CODE'
      | 'EXTENSION'
      | 'FLOW'
      | 'MPM'
      | 'ORDER_DETAILS'
      | 'OTP'
      | 'PHONE_NUMBER'
      | 'POSTBACK'
      | 'REMINDER'
      | 'SEND_LOCATION'
      | 'SPM'
      | 'QUICK_REPLY'
      | 'URL'
      | 'VOICE_CALL';
    message_template_button_text: string;
    message_template_button_url?: string;
    message_template_button_phone_number?: string;
  }>;
};

type WhatsAppTemplateQualityScore = 'GREEN' | 'RED' | 'YELLOW' | 'UNKNOWN';

export type WhatsAppMessageTemplateQualityUpdateValue = WhatsAppTemplateIdentity & {
  previous_quality_score: WhatsAppTemplateQualityScore;
  new_quality_score: WhatsAppTemplateQualityScore;
};

export type WhatsAppMessageTemplateStatusUpdateValue = WhatsAppTemplateIdentity & {
  event:
    | 'APPROVED'
    | 'ARCHIVED'
    | 'UNARCHIVED'
    | 'DELETED'
    | 'DISABLED'
    | 'FLAGGED'
    | 'IN_APPEAL'
    | 'LIMIT_EXCEEDED'
    | 'LOCKED'
    | 'PAUSED'
    | 'PENDING'
    | 'REINSTATED'
    | 'PENDING_DELETION'
    | 'REJECTED';
  reason:
    | 'ABUSIVE_CONTENT'
    | 'CATEGORY_NOT_AVAILABLE'
    | 'INCORRECT_CATEGORY'
    | 'INVALID_FORMAT'
    | 'NONE'
    | 'PROMOTIONAL'
    | 'SCAM'
    | 'TAG_CONTENT_MISMATCH'
    | null;
  message_template_category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  disable_info?: { disable_date: string };
  other_info?: {
    title: 'FIRST_PAUSE' | 'SECOND_PAUSE' | 'RATE_LIMITING_PAUSE' | 'UNPAUSE' | 'DISABLED';
    description: string;
  };
  rejection_info?: {
    reason: string;
    recommendation: string;
  };
};

export type WhatsAppPartnerSolutionsValue = {
  event: 'SOLUTION_CREATED' | 'SOLUTION_UPDATED';
  solution_id: string;
  solution_status:
    | 'ACTIVE'
    | 'DEACTIVATED'
    | 'DRAFT'
    | 'INITIATED'
    | 'PENDING_DEACTIVATION'
    | 'REJECTED';
};

export type WhatsAppPaymentConfigurationUpdateValue = {
  configuration_name: string;
  provider_name: 'billdesk' | 'payu' | 'razorpay' | 'zaakpay';
  provider_mid: string;
  status: 'Active' | 'Needs Connecting' | 'Needs Testing';
  created_timestamp: number;
  updated_timestamp: number;
};

export type WhatsAppPhoneNumberNameUpdateValue = {
  display_phone_number: string;
  decision: 'APPROVED' | 'DEFERRED' | 'PENDING' | 'REJECTED';
  requested_verified_name: string;
  rejection_reason:
    | 'NAME_EMPLOYEE_ISSUE'
    | 'NAME_ENDCLIENT_NOTRELATED'
    | 'NAME_FORMAT_UNACCEPTABLE'
    | 'NAME_INDIVIDUAL_ISSUE'
    | 'NAME_NOT_CONSISTENT'
    | 'UNKNOWN'
    | null;
};

export type WhatsAppPhoneNumberQualityUpdateValue = {
  display_phone_number: string;
  event: 'ONBOARDING' | 'THROUGHPUT_UPGRADE';
  current_limit?: WhatsAppTier; // deprecated
  old_limit?: WhatsAppTier; // deprecated
  max_daily_conversations_per_business: WhatsAppTier;
};

export type WhatsAppSecurityValue = {
  display_phone_number: string;
  event: 'PIN_CHANGED' | 'PIN_RESET_REQUEST' | 'PIN_REQUEST_SUCCESS';
  requester?: string; // only for PIN_RESET_REQUEST
};

export type WhatsAppSmbAppStateSyncValue = WhatsAppWebhookMessagingValue & {
  state_sync: Array<{
    type: 'contact';
    contact: {
      full_name?: string; // not set on remove
      first_name?: string; // not set on remove
      phone_number: string;
    };
    action: 'add' | 'remove';
    metadata: { timestamp: string };
  }>;
};

export type WhatsAppSmbMessageEchoesValue = WhatsAppWebhookMessagingValue & {
  message_echoes: Array<
    WhatsAppWebhookMessageContent & {
      to: string;
    }
  >;
};

export type WhatsAppTemplateCategoryUpdateValue = WhatsAppTemplateIdentity & {
  new_category: string;
} & (
    | {
        correct_category: string;
        category_update_timestamp: number;
      }
    | { previous_category: string }
  );

export type WhatsAppUserPreferencesValue = WhatsAppWebhookMessagingValue & {
  contacts: Array<{
    profile?: { name: string };
    wa_id: string;
  }>;
  user_preferences: Array<{
    wa_id: string;
    detail: string;
    category: 'marketing_messages';
    value: 'stop' | 'resume';
    timestamp: number;
  }>;
};

export type WhatsAppWebhookChange =
  | WhatsAppWebhookChangeOf<'account_alerts', WhatsAppAccountAlertsValue>
  | WhatsAppWebhookChangeOf<'account_review_update', WhatsAppAccountReviewUpdateValue>
  | WhatsAppWebhookChangeOf<'account_update', WhatsAppAccountUpdateValue>
  | WhatsAppWebhookChangeOf<'automatic_events', WhatsAppAutomaticEventsValue>
  | WhatsAppWebhookChangeOf<'business_capability_update', WhatsAppBusinessCapabilityUpdateValue>
  | WhatsAppWebhookChangeOf<'history', WhatsAppHistoryValue>
  | WhatsAppWebhookChangeOf<'message_template_components_update', WhatsAppMessageTemplateComponentsUpdateValue>
  | WhatsAppWebhookChangeOf<'message_template_quality_update', WhatsAppMessageTemplateQualityUpdateValue>
  | WhatsAppWebhookChangeOf<'message_template_status_update', WhatsAppMessageTemplateStatusUpdateValue>
  | WhatsAppWebhookMessagesChange
  | WhatsAppWebhookChangeOf<'partner_solutions', WhatsAppPartnerSolutionsValue>
  | WhatsAppWebhookChangeOf<'payment_configuration_update', WhatsAppPaymentConfigurationUpdateValue>
  | WhatsAppWebhookChangeOf<'phone_number_name_update', WhatsAppPhoneNumberNameUpdateValue>
  | WhatsAppWebhookChangeOf<'phone_number_quality_update', WhatsAppPhoneNumberQualityUpdateValue>
  | WhatsAppWebhookChangeOf<'security', WhatsAppSecurityValue>
  | WhatsAppWebhookChangeOf<'smb_app_state_sync', WhatsAppSmbAppStateSyncValue>
  | WhatsAppWebhookChangeOf<'smb_message_echoes', WhatsAppSmbMessageEchoesValue>
  | WhatsAppWebhookChangeOf<'template_category_update', WhatsAppTemplateCategoryUpdateValue>
  | WhatsAppWebhookChangeOf<'user_preferences', WhatsAppUserPreferencesValue>;

export type WhatsAppWebhook = {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: WhatsAppWebhookChange[];
  }>;
};
