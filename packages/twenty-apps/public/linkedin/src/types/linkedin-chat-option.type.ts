export type LinkedinChatOption = {
  id: string;
  // LinkedIn keeps separate threads with one person (InMail, Sales Navigator), listed as one option
  chatIds: string[];
  name: string;
  isGroup: boolean;
  lastMessageAt?: string;
};
