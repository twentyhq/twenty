import { type CardConfiguration } from '@/object-record/record-show/types/CardConfiguration';
import { type CardType } from '@/object-record/record-show/types/CardType';

export type LayoutCard = {
  type: CardType;
  configuration?: CardConfiguration;
};
