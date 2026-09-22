import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type InputClickActivationContext = {
  inputElement: SelectorElementLike;
  clickEvent: Event;
  dispatchEvent: (event: Event) => boolean;
};
