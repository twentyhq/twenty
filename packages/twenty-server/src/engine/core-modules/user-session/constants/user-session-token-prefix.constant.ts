// Makes opaque session tokens self-describing so the bearer-token dispatcher
// can route them without attempting JWT verification first.
export const USER_SESSION_TOKEN_PREFIX = 'sess_';
