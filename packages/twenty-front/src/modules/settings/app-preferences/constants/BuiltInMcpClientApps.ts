import ChatGptLogo from '@/settings/app-preferences/assets/built-in-mcp-client-apps/chatgpt.svg';
import ClaudeLogo from '@/settings/app-preferences/assets/built-in-mcp-client-apps/claude.svg';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { msg } from '@lingui/core/macro';

export const BUILT_IN_MCP_CLIENT_APPS: BuiltInMcpClientApp[] = [
  {
    id: 'chatgpt',
    name: msg`ChatGPT`,
    description: msg`Work with your Twenty workspace from ChatGPT through the official Twenty app.`,
    logo: ChatGptLogo,
  },
  {
    id: 'claude',
    name: msg`Claude`,
    description: msg`Work with your Twenty workspace from Claude through the Twenty connector.`,
    logo: ClaudeLogo,
  },
];
