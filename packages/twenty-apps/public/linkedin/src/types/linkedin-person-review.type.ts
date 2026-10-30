// A participant whose name matches several People and whose profile link matches none
export type LinkedinPersonReview = {
  handle: string;
  displayName: string;
  firstName: string;
  lastName: string;
  candidatePersonIds: string[];
  lastMessageAt: string;
};
