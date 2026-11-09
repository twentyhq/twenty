export type CalEventTypeReference = { eventTypeSlug: string } & (
  | { teamSlug: string }
  | { username: string }
);
