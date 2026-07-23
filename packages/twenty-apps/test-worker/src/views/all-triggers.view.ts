import {
  defineView,
  getFieldUniversalIdentifier,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TRIGGER_UNIVERSAL_IDENTIFIER,
} from 'src/objects/trigger.object';

const TRIGGER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: TRIGGER_UNIVERSAL_IDENTIFIER,
    name: 'createdAt',
  });

const TRIGGER_CREATED_BY_FIELD_UNIVERSAL_IDENTIFIER =
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: TRIGGER_UNIVERSAL_IDENTIFIER,
    name: 'createdBy',
  });

export default defineView({
  universalIdentifier: 'a68379da-d6b5-4224-9e1b-07a8bec75438',
  name: 'All Triggers',
  objectUniversalIdentifier: TRIGGER_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconMoon',
  position: 0,
  fields: [
    {
      universalIdentifier: '7ab190c3-7673-4e2c-9f0b-e94ff008acbc',
      fieldMetadataUniversalIdentifier: TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 300,
    },
    {
      universalIdentifier: '4b688a24-a646-4466-b4d1-b03c4f6df206',
      fieldMetadataUniversalIdentifier:
        TRIGGER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '09987583-d175-4944-9312-ebc62b4034a4',
      fieldMetadataUniversalIdentifier:
        TRIGGER_CREATED_BY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 200,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'a8671428-5a04-4406-9d37-6dda9b299279',
      fieldMetadataUniversalIdentifier:
        TRIGGER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
