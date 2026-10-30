import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

export type ScrollIntoViewRequest = {
  method: 'scrollIntoView';
  block: ScrollIntoViewAlignment;
  inline: ScrollIntoViewAlignment;
};
