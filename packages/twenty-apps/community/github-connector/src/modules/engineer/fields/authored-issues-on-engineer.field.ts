import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { ENGINEER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/objects/engineer.object';
import { ISSUE_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/objects/issue.object';
import { ISSUE_AUTHOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/fields/author-on-issue.field';

export const AUTHORED_ISSUES_FIELD_UNIVERSAL_IDENTIFIER =
  '31f185c0-d2a2-47e2-9132-8cbac05f174a';

export default defineField({
  universalIdentifier: AUTHORED_ISSUES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: ENGINEER_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'authoredIssues',
  label: 'Authored Issues',
  icon: 'IconBug',
  relationTargetObjectMetadataUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    ISSUE_AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
