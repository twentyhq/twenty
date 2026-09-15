// Every helper selects the same fields, so an AppMessageChannel returned by
// one is interchangeable with one returned by another.
export const APP_MESSAGE_CHANNEL_SELECTION = `
  id
  handle
  displayName
  visibility
  connectedAccountId
  isSyncEnabled
`;
