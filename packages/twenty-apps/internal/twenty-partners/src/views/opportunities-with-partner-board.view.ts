import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITIES_WITH_PARTNER_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Kanban board of partnered opportunities, one column per match status (in pipeline
// order). Same with-partner filter as the table view. Empty columns (e.g. the pre-match
// statuses, which never apply to a partnered opp) are left to the per-view "Hide empty
// groups" toggle — we don't hide columns declaratively (brittle long-term).
export default defineView({
  universalIdentifier: OPPORTUNITIES_WITH_PARTNER_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'OPP with partner (board)',
  icon: 'IconLayoutKanban',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  position: 2,
  mainGroupByFieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  // Kanban columns — all visible. A manifest-defined kanban does not auto-create its
  // groups, so they must be declared (otherwise the board renders blank).
  groups: [
    { universalIdentifier: '01361796-2bb6-4cd0-82ec-ac71f81468c9', fieldValue: 'TO_BE_MATCHED', position: 0, isVisible: true },
    { universalIdentifier: 'cc6a04b2-d5f9-411d-b344-a78a114ffe0a', fieldValue: 'MANUAL_MATCH', position: 1, isVisible: true },
    { universalIdentifier: '4c2be421-0626-49db-807c-3b2b324bf61d', fieldValue: 'AUTO_MATCH', position: 2, isVisible: true },
    { universalIdentifier: '09dae3dc-ac9a-44dc-a875-7e7a1f127537', fieldValue: 'MATCHED', position: 3, isVisible: true },
    { universalIdentifier: 'ccfc2d1f-554b-4152-8eed-5759b4820a99', fieldValue: 'INTRODUCED_TO_A_PARTNER', position: 4, isVisible: true },
    { universalIdentifier: '04bf9e33-8cda-487c-bfdf-573cbe658bda', fieldValue: 'WORKING_WITH_A_PARTNER', position: 5, isVisible: true },
    { universalIdentifier: 'e966a846-7f1b-4091-a50b-473387fcd009', fieldValue: 'IMPLEMENTING', position: 6, isVisible: true },
    { universalIdentifier: 'dd3f67b8-5468-4345-9c7e-1d61fd12b3e3', fieldValue: 'WON', position: 7, isVisible: true },
    { universalIdentifier: '6abcc9a5-eed0-48bd-bb00-fc06283429ad', fieldValue: 'RECONNECT_LATER', position: 8, isVisible: true },
    { universalIdentifier: '985c64fc-8694-4f92-b183-1deaa287a43e', fieldValue: 'LOST', position: 9, isVisible: true },
  ],
  fields: [
    // Name (opportunity)
    { universalIdentifier: '9d8ee0ee-1b32-4c42-b968-7c18a0e90b25', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true },
    // Partner
    { universalIdentifier: '619d7e2f-05db-4c40-8fa4-87fa30a8e8b0', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 1, isVisible: true },
    // Amount
    { universalIdentifier: 'c19fb75d-0b41-4997-920f-e9bfd1d01e06', fieldMetadataUniversalIdentifier: '20202020-583e-4642-8533-db761d5fa82f', position: 2, isVisible: true },
    // Match status — hidden on the card (it's already the column), kept only so the
    // group-by field is part of the view.
    { universalIdentifier: '5cb6903b-3220-4c96-a977-5a35d0136f33', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: false },
  ],
  filters: [
    {
      universalIdentifier: 'b46f2c0b-c37e-41a2-981a-fd642687cf4d',
      fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49',
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    },
  ],
});
