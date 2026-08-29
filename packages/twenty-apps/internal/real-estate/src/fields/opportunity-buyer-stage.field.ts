import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const BUYER_STAGE_FIELD_ID = '268886e5-6083-42a1-a18b-3b183bd0af12';

export enum BuyerStage {
  COMPLETING_PROFILE = 'COMPLETING_PROFILE',
  SHOWING = 'SHOWING',
  OFFER_MADE = 'OFFER_MADE',
  CLOSING = 'CLOSING',
  WON = 'WON',
  LOST = 'LOST',
}

export const BUYER_STAGE_OPTIONS = [
  { id: 'e1bada75-8b25-4001-9c42-1ef0bcdc39c6', value: BuyerStage.COMPLETING_PROFILE, label: 'Completing profile', position: 0, color: 'gray' as const },
  { id: '668e4af7-f967-409e-a625-33ae4cab3e16', value: BuyerStage.SHOWING, label: 'Showing', position: 1, color: 'blue' as const },
  { id: '5556a6de-e158-4e67-8ba0-2cfe670f53db', value: BuyerStage.OFFER_MADE, label: 'Offer made', position: 2, color: 'orange' as const },
  { id: '2289bfc5-dcc7-4348-b001-dbf63eeaef8d', value: BuyerStage.CLOSING, label: 'Closing', position: 3, color: 'purple' as const },
  { id: '98bde945-071e-4207-a0dd-3c3445edf26f', value: BuyerStage.WON, label: 'Won', position: 4, color: 'green' as const },
  { id: 'a00947c7-47de-4fa5-946c-0a141c7cb33f', value: BuyerStage.LOST, label: 'Lost', position: 5, color: 'red' as const },
];

export default defineField({
  universalIdentifier: BUYER_STAGE_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'buyerStage',
  label: 'Buyer stage',
  description: 'Where the buyer is in their journey',
  icon: 'IconRoute',
  isNullable: true,
  options: BUYER_STAGE_OPTIONS,
});
