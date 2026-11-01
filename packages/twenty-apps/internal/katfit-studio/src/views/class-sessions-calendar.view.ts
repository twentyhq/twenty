import { FIELD_UNIVERSAL_IDENTIFIER as TRAINER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/trainer-on-class-session.field';
import {
  defineView,
  ViewCalendarLayout,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';

import {
  CLASS_SESSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/objects/class-session.object';
import { GROUP_ON_SESSION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/group-on-session.field';

export default defineView({
  universalIdentifier: 'c12d7d5e-4d23-4e94-91a2-ae2d3844498b',
  name: 'Календарь занятий',
  objectUniversalIdentifier: CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.CALENDAR,
  icon: 'IconCalendarEvent',
  position: 1,
  calendarLayout: ViewCalendarLayout.MONTH,
  calendarFieldMetadataUniversalIdentifier:
    '37033f49-d77e-4127-901c-20ff00e951c3',
  filters: [
    {
      universalIdentifier: '2b96cafa-bb7f-4571-b710-4470c4e6edc2',
      fieldMetadataUniversalIdentifier:
        '81326384-2b7c-4213-955c-d83c923bfeb8',
      operand: ViewFilterOperand.IS_NOT,
      value: ['COMPLETED', 'CANCELLED_BY_STUDIO'],
    },
  ],
  fields: [
    { universalIdentifier: 'cbf3a4a0-9468-4a5e-8a3f-588bba0a099b', fieldMetadataUniversalIdentifier: TRAINER_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 180 },
    {
      universalIdentifier: 'd3a808cf-44dc-4a5b-a821-cc8f4a3f7f58',
      fieldMetadataUniversalIdentifier:
        CLASS_SESSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '2b3a29d0-a191-4fa9-b0cf-7d55a4c8a5ef',
      fieldMetadataUniversalIdentifier:
        GROUP_ON_SESSION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
  ],
});
