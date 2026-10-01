import { type NodeWithOwnerDocument } from '@/polyfills/dom/types/NodeWithOwnerDocument';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type InputClickActivationContext = {
  inputElement: SelectorElementLike & NodeWithOwnerDocument;
  clickEvent: Event;
  dispatchEvent: (event: Event) => boolean;
};
