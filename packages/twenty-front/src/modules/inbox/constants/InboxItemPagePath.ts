// Deliberately not an AppPath member. That enum is inlined into the SDK's
// published types, so adding to it diverges the front's copy from the SDK's
// and breaks unrelated front component call sites. An inbox-internal route
// does not need to be part of that contract.
export const INBOX_ITEM_PAGE_PATH = '/inbox/:inboxSectionSlug/:inboxItemId';
