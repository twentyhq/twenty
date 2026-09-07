export type FakeSlackChannel = {
  id: string;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  isMember: boolean;
  isDirectMessage: boolean;
  numMembers: number;
  topic: string;
  purpose: string;
};
