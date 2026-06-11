import { ViewType, defineView } from 'twenty-sdk/define';

import {
  BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  BRIEF_OPPORTUNITY_FIELD_ID,
} from 'src/objects/brief.object';

// FIELDS_WIDGET view backing the Brief record page / side-panel "Fields" tab.
// Relation fields are hidden by default in the fields widget unless an explicit
// view marks them visible — that is the whole point of this view.
//
// The to-many `applications` relation is intentionally NOT listed here: the
// inline fields widget only renders a truncated one-line chip for a to-many.
// It is shown instead as a dedicated FIELD/CARD widget in brief.page-layout.ts,
// which lists every linked Application.
export const BRIEF_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER = 'c0a8b150-0000-4000-8000-000000000001';

export default defineView({
  universalIdentifier: BRIEF_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Brief Record Page Fields',
  objectUniversalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    { universalIdentifier: 'c0a8b150-0000-4000-8000-000000000011', fieldMetadataUniversalIdentifier: BRIEF_OPPORTUNITY_FIELD_ID, position: 0, isVisible: true },
    { universalIdentifier: 'c0a8b150-0000-4000-8000-000000000012', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000006', position: 1, isVisible: true },
    { universalIdentifier: 'c0a8b150-0000-4000-8000-000000000013', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000005', position: 2, isVisible: true },
    { universalIdentifier: 'c0a8b150-0000-4000-8000-000000000014', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000003', position: 3, isVisible: true },
    { universalIdentifier: 'c0a8b150-0000-4000-8000-000000000015', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000004', position: 4, isVisible: true },
  ],
});
