export type TeamsAssistantStatusWriter = {
  update: (text: string) => Promise<void>;
  finish: (text: string) => Promise<void>;
};
