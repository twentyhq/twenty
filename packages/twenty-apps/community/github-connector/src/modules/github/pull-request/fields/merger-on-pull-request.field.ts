import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { ENGINEER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/objects/engineer.object';
import { MASTERPIECES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/fields/masterpieces-on-engineer.field';

export const MERGER_FIELD_UNIVERSAL_IDENTIFIER =
  '3a4a6af0-a6a7-4cb6-a91d-273a2842449e';

export default defineField({
  universalIdentifier: MERGER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'merger',
  label: 'Merger',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: ENGINEER_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MASTERPIECES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'mergerId',
  },
});
