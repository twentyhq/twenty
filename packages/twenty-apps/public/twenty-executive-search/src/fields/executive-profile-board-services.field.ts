import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER } from '../objects/executive-board-service.object';
import { EXECUTIVE_BOARD_SERVICE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-board-service.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_BOARD_SERVICE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveBoardServices',
  label: 'Board Services',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '5bcbb1c9-4c9b-4dbb-b42a-b4ea56ff3f85', // EXECUTIVE_BOARD_SERVICE_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
