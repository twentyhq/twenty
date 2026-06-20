import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_SUPPORT_TICKET_OBJECT_ID = 'a2f0ea53-5c4a-59ff-8496-7afdf57c3831';
export const XOPURE_SUPPORT_TICKET_NUMBER_FIELD_ID = '20dcfcb8-d12c-5684-9e69-4b11d5439ef4';
export const XOPURE_SUPPORT_TICKET_STATUS_FIELD_ID = 'f7cea11f-0b68-5239-aa8a-444690764c30';
export const XOPURE_SUPPORT_TICKET_PRIORITY_FIELD_ID = 'd0a84435-50e2-5955-977a-1ecc27b7d49f';

export default defineObject({
  universalIdentifier: XOPURE_SUPPORT_TICKET_OBJECT_ID,
  nameSingular: 'xopureSupportTicket',
  namePlural: 'xopureSupportTickets',
  labelSingular: 'Support Ticket',
  labelPlural: 'Support Tickets',
  description: 'Synced support ticket from XO Pure helpdesk systems for CRM visibility and triage workflows.',
  icon: 'IconLifebuoy',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_SUPPORT_TICKET_NUMBER_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_SUPPORT_TICKET_NUMBER_FIELD_ID, type: FieldType.TEXT, name: 'ticketNumber', label: 'Ticket number', icon: 'IconHash', isUnique: true },
    { universalIdentifier: '8608b360-be0c-5a59-bb05-aa10e63a7b3d', type: FieldType.TEXT, name: 'supabaseTicketId', label: 'Supabase ticket ID', icon: 'IconDatabase', isUnique: true },
    {
      universalIdentifier: XOPURE_SUPPORT_TICKET_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconCircleDot',
      defaultValue: "'NEW'",
      options: [
        { id: '25340d8a-5bdd-57c1-8f15-d5a79b6d79b4', value: 'NEW', label: 'New', position: 0, color: 'blue' },
        { id: '27d0658d-662e-5648-b675-99658a1426ee', value: 'PENDING_CUSTOMER', label: 'Pending customer', position: 1, color: 'yellow' },
        { id: '3b780017-8c37-5484-a63f-5632324b8cd1', value: 'RESOLVED', label: 'Resolved', position: 2, color: 'green' },
        { id: '665b00e3-d701-5c2a-8de7-9cbbc4b0000b', value: 'CLOSED', label: 'Closed', position: 3, color: 'gray' },
      ],
    },
    {
      universalIdentifier: XOPURE_SUPPORT_TICKET_PRIORITY_FIELD_ID,
      type: FieldType.SELECT,
      name: 'priority',
      label: 'Priority',
      icon: 'IconAlertTriangle',
      defaultValue: "'NORMAL'",
      options: [
        { id: '11ec1484-0e54-5e03-9821-96123063835e', value: 'LOW', label: 'Low', position: 0, color: 'gray' },
        { id: '3ef4dcd3-281c-5f12-8426-922b8c1ce21f', value: 'NORMAL', label: 'Normal', position: 1, color: 'blue' },
        { id: '70b4eaed-9e25-56ee-97b7-df64f757cceb', value: 'HIGH', label: 'High', position: 2, color: 'orange' },
        { id: '0690858a-174a-59a5-9d1a-8dc540c61db0', value: 'URGENT', label: 'Urgent', position: 3, color: 'red' },
      ],
    },
    { universalIdentifier: '2dc298c2-f5fc-5069-9025-4f87925d5adb', type: FieldType.TEXT, name: 'category', label: 'Category', icon: 'IconTag' },
    { universalIdentifier: '2133d629-3e2b-5810-93f8-d1ee8a2eda63', type: FieldType.TEXT, name: 'channel', label: 'Channel', icon: 'IconBroadcast' },
    { universalIdentifier: 'c417606f-d02d-5d05-b122-d1b5741756c2', type: FieldType.TEXT, name: 'subject', label: 'Subject', icon: 'IconMessage' },
    { universalIdentifier: 'd5d1ce9f-e623-5b02-a27b-540074b20f84', type: FieldType.TEXT, name: 'body', label: 'Body', icon: 'IconAlignLeft' },
    { universalIdentifier: '7971ac76-155b-5724-a16a-f302fe47b0d4', type: FieldType.TEXT, name: 'requesterEmail', label: 'Requester email', icon: 'IconMail' },
    { universalIdentifier: '702c91dc-b9a5-5b1f-8c52-0700c58e3cbc', type: FieldType.TEXT, name: 'requesterName', label: 'Requester name', icon: 'IconUser' },
    { universalIdentifier: 'cae79105-c72e-5229-92f4-ea3738c12cb4', type: FieldType.TEXT, name: 'requesterPhone', label: 'Requester phone', icon: 'IconPhone', isNullable: true, defaultValue: null },
    { universalIdentifier: '8594d188-0728-5ff4-ad48-b6a14efbe857', type: FieldType.NUMBER, name: 'messageCount', label: 'Message count', icon: 'IconMessageDots', defaultValue: 0 },
    { universalIdentifier: '647b7edc-7ec7-59a0-a067-d083538d9756', type: FieldType.DATE_TIME, name: 'firstResponseAt', label: 'First response at', icon: 'IconClock', isNullable: true, defaultValue: null },
    { universalIdentifier: '337c75d9-227c-5793-9357-16f008e3064f', type: FieldType.DATE_TIME, name: 'resolvedAt', label: 'Resolved at', icon: 'IconCheck', isNullable: true, defaultValue: null },
    { universalIdentifier: '18a51c53-ee91-5ffb-8cb0-dc93d88f04ae', type: FieldType.DATE_TIME, name: 'closedAt', label: 'Closed at', icon: 'IconX', isNullable: true, defaultValue: null },
    { universalIdentifier: '8082e242-6f43-55f4-b5cf-92067c927a4a', type: FieldType.DATE_TIME, name: 'lastActivityAt', label: 'Last activity at', icon: 'IconClock' },
    { universalIdentifier: '834bfc71-a55b-58cb-aee0-b4b6491413f8', type: FieldType.DATE_TIME, name: 'lastSyncedAt', label: 'Last synced at', icon: 'IconRefresh', isNullable: true, defaultValue: null },
  ],
});
