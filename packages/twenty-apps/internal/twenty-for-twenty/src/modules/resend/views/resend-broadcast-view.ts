import { RESEND_EMAILS_ON_BROADCAST_ID } from 'src/modules/resend/fields/resend-emails-on-broadcast.field';
import { SEGMENT_ON_RESEND_BROADCAST_ID } from 'src/modules/resend/fields/segment-on-resend-broadcast.field';
import { TEMPLATE_ON_RESEND_BROADCAST_ID } from 'src/modules/resend/fields/template-on-resend-broadcast.field';
import {
  BROADCAST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/objects/resend-broadcast';
import { defineView } from 'twenty-sdk';

export const RESEND_BROADCAST_VIEW_UNIVERSAL_IDENTIFIER =
  '9875e352-4dd7-4296-9291-5de5864594b8';

export default defineView({
  universalIdentifier: RESEND_BROADCAST_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend broadcasts',
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconSpeakerphone',
  position: 0,
  fields: [
    {
      universalIdentifier: '7d2bd63b-d609-441e-97b7-8d72e1f64fcb',
      fieldMetadataUniversalIdentifier:
        BROADCAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: '0cb2b32f-a7ca-4c6e-91af-705be37416dd',
      fieldMetadataUniversalIdentifier:
        BROADCAST_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: '24261a77-9ddd-4fee-bcef-10308b6e438e',
      fieldMetadataUniversalIdentifier:
        BROADCAST_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: 'ba957060-3879-4812-98ac-0199732c79d9',
      fieldMetadataUniversalIdentifier:
        BROADCAST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: '7e78132b-7b33-468e-962d-d7bb1b3025d4',
      fieldMetadataUniversalIdentifier:
        BROADCAST_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: 'fdcf945c-5d0f-42f2-94e6-765d5216bd2f',
      fieldMetadataUniversalIdentifier:
        BROADCAST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: '4d7eb630-9f44-4090-a887-7fb08e0c49ed',
      fieldMetadataUniversalIdentifier: SEGMENT_ON_RESEND_BROADCAST_ID,
      isVisible: true,
      size: 12,
      position: 6,
    },
    {
      universalIdentifier: '82646a38-16f8-45a9-8b97-a3e910865bbf',
      fieldMetadataUniversalIdentifier: TEMPLATE_ON_RESEND_BROADCAST_ID,
      isVisible: true,
      size: 12,
      position: 7,
    },
    {
      universalIdentifier: 'e1726752-fed7-4e9b-b395-e47b60f3d56d',
      fieldMetadataUniversalIdentifier: RESEND_EMAILS_ON_BROADCAST_ID,
      isVisible: true,
      size: 12,
      position: 8,
    },
  ],
});
