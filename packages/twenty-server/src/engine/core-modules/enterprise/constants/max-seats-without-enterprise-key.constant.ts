/* @license Enterprise */

// Custom AI providers stay complimentary for small organizations: an instance
// is only asked for an enterprise key once it grows past this many distinct
// users, so self-hosters and small teams are never gated.
export const MAX_SEATS_WITHOUT_ENTERPRISE_KEY = 25;
