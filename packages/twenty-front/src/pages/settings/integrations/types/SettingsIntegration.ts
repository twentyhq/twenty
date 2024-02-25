export type SettingsIntegrationType = 'Use' | 'Goto' | 'Soon';

export type SettingsIntegration = {
  from: { key: string; image: string };
  to: { key: string; image: string } | null;
  type: SettingsIntegrationType;
  linkText?: string;
  link: string;
  text: string;
};
