// One messaging channel the running app owns. Returned from
// `createMessageChannel` and `listMessageChannels`.
//
// The shape lives in twenty-shared so this re-export and the server-side
// projection always agree — changes propagate to both at once.
export type { AppMessageChannel } from 'twenty-shared/application';
