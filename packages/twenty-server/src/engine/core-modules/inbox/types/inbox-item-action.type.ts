import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-resolution.type';
import { type InboxItemTransition } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';

// Navigation is the one thing the client resolves on its own, because it is
// not a change to the item. Everything else is a transition.
export type InboxItemNavigation = {
  kind: 'OPEN_THREAD' | 'OPEN_SUBJECT_RECORD';
};

// An action a type offers. It either navigates or names the transition it
// performs, so a new kind of work needs no new dispatch code.
export type InboxItemAction = {
  key: string;
  label: string;
  icon?: string;
  isPrimary?: boolean;
  // Collected from the person before the transition is applied, then passed
  // through as the transition's result
  inputSchema?: InboxItemFieldSchema[];
} & (
  | { navigation: InboxItemNavigation; transition?: never }
  | { transition: InboxItemTransition; navigation?: never }
);
