import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

// The pre-2.29 pinned universal identifiers of the 20 curated standard
// record-page layouts, keyed by their object. The 2-29 record-page re-own
// derives layout identifiers from the object, so these literals were removed
// from the shared constants; the standard reconcile command still needs them
// to locate the curated layout row of each standard object in workspaces that
// predate the derivation. Frozen: never mutate these values.
export const PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER: Record<
  string,
  string
> = {
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company]:
    '20202020-a101-4001-8001-c0aba11c0001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person]:
    '20202020-a102-4002-8002-ae0a1ea11002',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity]:
    '20202020-a103-4003-8003-0aa0b1ca1003',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note]:
    '20202020-a104-4004-8004-a0be5a11a004',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task]:
    '20202020-a105-4005-8005-ba5ca11a1005',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflow]:
    '20202020-a106-4006-8006-a0bcf10aa006',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowVersion]:
    '20202020-a107-4007-8007-a0bcf10ab007',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowRun]:
    '20202020-a108-4008-8008-a0bcf10ac008',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.blocklist]:
    '20202020-a109-4009-8009-b10c115b0001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarChannelEventAssociation]:
    '20202020-a10b-400b-800b-ca1c4e0b0001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent]:
    'b9b10e40-9ce2-4704-8ac6-c6e92e2563c1',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEventParticipant]:
    '20202020-a10c-400c-800c-ca1e0a0c0001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording]:
    'fa475fb3-3fe4-4ab8-8320-495eba5b2e58',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageChannelMessageAssociation]:
    '20202020-a111-4011-8011-a5c4a5110001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageChannelMessageAssociationMessageFolder]:
    '20202020-a112-4012-8012-a5c4a6120001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageParticipant]:
    '20202020-a114-4014-8014-a5ea10140001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowAutomatedTrigger]:
    '20202020-a115-4015-8015-a0bcf1150001',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageThread]:
    '20202020-95bb-40eb-a699-70e7ea02a79e',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageList]:
    'c1f0a2b3-4d5e-4f60-8a71-9b2c3d4e5f60',
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign]:
    '8704b091-94bd-4f8f-82b1-e2f3eab92217',
};
