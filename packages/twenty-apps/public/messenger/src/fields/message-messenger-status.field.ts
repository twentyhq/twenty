import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  MESSENGER_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS,
  MESSENGER_STATUS_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MESSENGER_STATUS_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'messengerStatus',
  label: 'Messenger status',
  description:
    'Whether the customer received or read a message the Page sent on Messenger',
  type: FieldType.SELECT,
  icon: 'IconChecks',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  isNullable: true,
  options: [
    {
      id: MESSENGER_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS.delivered,
      value: 'DELIVERED',
      label: 'Delivered',
      color: 'blue',
      position: 0,
    },
    {
      id: MESSENGER_STATUS_MESSAGE_FIELD_OPTION_UNIVERSAL_IDENTIFIERS.read,
      value: 'READ',
      label: 'Read',
      color: 'green',
      position: 1,
    },
  ],
});
