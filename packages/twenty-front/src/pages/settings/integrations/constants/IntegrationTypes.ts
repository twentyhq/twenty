export enum IntegrationType {
  Use = 'Use',
  Goto = 'Goto',
  Soon = 'Soon',
}

export interface Integration {
  from: { key: string; image: string };
  to: { key: string; image: string } | null;
  type: IntegrationType;
  linkText?: string;
  link: string;
  text: string;
}

export interface IntegrationCategory {
  key: string;
  title: string;
  hyperlinkText?: string;
  hyperlink: string | null;
  integrations: Integration[];
}
