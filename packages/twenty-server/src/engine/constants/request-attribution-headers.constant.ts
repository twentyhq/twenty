// Response headers read by the reverse proxy access log, then stripped before
// the response leaves the edge. They are the only per-request record of who
// called and what ran: the access log sees one opaque POST /graphql otherwise.
export const REQUEST_ACTOR_HEADER = 'X-Twenty-Actor';
export const REQUEST_RESOLVERS_HEADER = 'X-Twenty-Resolvers';
