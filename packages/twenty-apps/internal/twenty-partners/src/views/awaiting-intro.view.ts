import {
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  APPLICATION_BRIEF_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_PARTNER_FIELD_ID,
} from 'src/objects/application.object';

export const AWAITING_INTRO_VIEW_UNIVERSAL_IDENTIFIER = 'c0a8b110-0000-4000-8000-000000000007';

// Ops inbox: Applications a client has picked (INTRODUCED) but no intro has
// been sent yet (introSentAt empty). Empties itself as admins stamp introSentAt.
export default defineView({
  universalIdentifier: AWAITING_INTRO_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Awaiting intro',
  icon: 'IconBellRinging',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000001', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000002', position: 0, isVisible: true },
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000002', fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID, position: 1, isVisible: true },
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000003', fieldMetadataUniversalIdentifier: APPLICATION_BRIEF_FIELD_ID, position: 2, isVisible: true },
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000004', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000009', position: 3, isVisible: true },
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000005', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000003', position: 4, isVisible: true },
  ],
  filters: [
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000010', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000003', operand: ViewFilterOperand.IS, value: ['INTRODUCED'] },
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000011', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000010', operand: ViewFilterOperand.IS_EMPTY, value: '' },
  ],
  sorts: [
    { universalIdentifier: 'c0a8b122-0000-4000-8000-000000000012', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000009', direction: ViewSortDirection.ASC },
  ],
});
