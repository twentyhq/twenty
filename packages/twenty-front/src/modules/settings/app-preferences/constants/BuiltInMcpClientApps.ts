import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import ClaudeLogo from '@/settings/mcp/assets/mcp-clients/claude-color.png';
import OpenAiLogo from '@/settings/mcp/assets/mcp-clients/openai.svg';
import { msg } from '@lingui/core/macro';
import { IconModelClaude, IconProviderOpenai } from 'twenty-ui/icon';

export const BUILT_IN_MCP_CLIENT_APPS: BuiltInMcpClientApp[] = [
  {
    id: 'chatgpt',
    name: msg`ChatGPT`,
    description: msg`Work with your Twenty workspace from ChatGPT through the official Twenty app.`,
    logo: OpenAiLogo,
    Icon: IconProviderOpenai,
    redirectUriHostnames: ['chatgpt.com'],
  },
  {
    id: 'claude',
    name: msg`Claude`,
    description: msg`Work with your Twenty workspace from Claude through the Twenty connector.`,
    logo: ClaudeLogo,
    Icon: IconModelClaude,
    redirectUriHostnames: ['claude.ai', 'claude.com'],
  },
];
