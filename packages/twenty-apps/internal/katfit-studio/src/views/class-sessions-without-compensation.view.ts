import { defineView, ViewType, ViewFilterOperand } from 'twenty-sdk/define';
import {
  CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  CLASS_SESSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/class-session.object';
export default defineView({
  universalIdentifier: '9dd35a64-4891-412f-ba24-d8042158230c',
  name: 'Проведены — не закрыты',
  objectUniversalIdentifier: CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCalendarEvent',
  position: 2,
  filters: [
    {
      universalIdentifier: '65c1fdaf-5b2c-473c-953f-c02278b936a6',
      fieldMetadataUniversalIdentifier: '81326384-2b7c-4213-955c-d83c923bfeb8',
      operand: ViewFilterOperand.IS,
      value: ['COMPLETED'],
    },
    {
      universalIdentifier: 'ca893f2c-a1da-49a0-bcff-4660661d6451',
      fieldMetadataUniversalIdentifier: '49cc8fa6-6591-4e23-a538-ab494d601bfd',
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
    },
  ],
  fields: [
    {
      universalIdentifier: 'f7a81cab-1bf8-4682-af6f-f8713165d6c0',
      fieldMetadataUniversalIdentifier:
        CLASS_SESSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 280,
    },
  ],
});
