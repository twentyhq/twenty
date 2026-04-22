import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { ISSUE_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/objects/issue.object';
import { ISSUE_AUTHOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/fields/author-on-issue.field';

export const AUTHORED_ISSUES_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER =
  '31f185c0-d2a2-47e2-9132-8cbac05f174a';

export default defineField({
  universalIdentifier: AUTHORED_ISSUES_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
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
