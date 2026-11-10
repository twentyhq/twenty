import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';

export const CHATGPT_CONNECTABLE_APP: ConnectableApp = {
  id: '6e58bb83-49dc-4d4d-ae82-662890eda505',
  name: 'ChatGPT',
  description:
    'Work with your Twenty workspace from ChatGPT through the official Twenty app.',
  logoUrl: null,
  connectUrl: 'https://chatgpt.com/apps/twenty',
};

export const CLAUDE_CONNECTABLE_APP: ConnectableApp = {
  id: '3e0bda4b-fb1d-42bd-bab3-03b66698e6ff',
  name: 'Claude',
  description:
    'Work with your Twenty workspace from Claude through the Twenty connector.',
  logoUrl: null,
  connectUrl:
    'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Twenty&connectorUrl={mcpServerUrl}',
};
