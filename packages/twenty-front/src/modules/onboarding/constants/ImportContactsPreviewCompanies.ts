export type ImportContactsPreviewCompany = {
  id: string;
  name: string;
  domainName: string;
};

export const IMPORT_CONTACTS_PREVIEW_COMPANIES = [
  { id: 'figma', name: 'Figma', domainName: 'figma.com' },
  { id: 'anthropic', name: 'Anthropic', domainName: 'anthropic.com' },
  { id: 'notion', name: 'Notion', domainName: 'notion.so' },
  { id: 'airbnb', name: 'Airbnb', domainName: 'airbnb.com' },
  { id: 'linkedin', name: 'Linkedin', domainName: 'linkedin.com' },
  { id: 'slack', name: 'Slack', domainName: 'slack.com' },
] satisfies ImportContactsPreviewCompany[];
