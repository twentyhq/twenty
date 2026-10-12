export type CommandOptionDefinition = {
  flags: string;
  description: string;
  choices?: readonly string[];
  required?: boolean;
  hidden?: boolean;
};
