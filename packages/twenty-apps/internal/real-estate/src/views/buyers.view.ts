import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';
import { PERSON_TYPE_FIELD_UNIVERSAL_IDENTIFIER } from '../fields/person-type.field';
import { BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER } from '../fields/person-budget-min.field';
import { BUDGET_MAX_FIELD_UNIVERSAL_IDENTIFIER } from '../fields/person-budget-max.field';
import { PRE_APPROVED_FIELD_UNIVERSAL_IDENTIFIER } from '../fields/person-pre-approved.field';
import { DESIRED_AREA_FIELD_UNIVERSAL_IDENTIFIER } from '../fields/person-desired-area.field';

export const BUYERS_VIEW_ID = 'd34441a5-51bc-4826-b5cc-828d536de602';

const personFields = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields;

export default defineView({
  universalIdentifier: BUYERS_VIEW_ID,
  name: 'Buyers',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconUserSearch',
  position: 11,
  fields: [
    { universalIdentifier: '70f73b71-afc5-44e3-b9d7-8bb89670cd91', fieldMetadataUniversalIdentifier: personFields.name.universalIdentifier, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: '5ab16f37-55f6-4c45-98c4-096ef3087c43', fieldMetadataUniversalIdentifier: DESIRED_AREA_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '2b1766af-894e-4b9a-a974-07953ceea577', fieldMetadataUniversalIdentifier: BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 130 },
    { universalIdentifier: '6dd553b3-1c4b-4cea-9ae4-c600a8215bb4', fieldMetadataUniversalIdentifier: BUDGET_MAX_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 130 },
    { universalIdentifier: 'df024778-8780-4d9b-b78b-316fe5ce519d', fieldMetadataUniversalIdentifier: PRE_APPROVED_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 120 },
  ],
  filters: [
    {
      universalIdentifier: 'f0550294-9a36-4ffc-a4d8-76ab048a7e6e',
      fieldMetadataUniversalIdentifier: PERSON_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: ['BUYER'],
    },
  ],
});
