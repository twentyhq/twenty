// a template component as stored from Meta, kept loose because it is read from a JSON field
export type WhatsAppTemplateComponent = {
  type: string;
  format?: string;
  text?: string;
  buttons?: Array<{ type: string; text?: string; url?: string }>;
};
