import ChatGptLogo from '@/settings/app-preferences/assets/built-in-mcp-client-apps/chatgpt.svg';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import ClaudeLogo from '@/settings/mcp/assets/mcp-clients/claude-color.png';
import { msg } from '@lingui/core/macro';
import { IconModelClaude, IconProviderOpenai } from 'twenty-ui/icon';
import { WellKnownOAuthClient } from '~/generated-metadata/graphql';

export const BUILT_IN_MCP_CLIENT_APPS: BuiltInMcpClientApp[] = [
  {
    id: 'chatgpt',
    name: msg`ChatGPT`,
    description: msg`Work with your Twenty workspace from ChatGPT through the official Twenty app.`,
    logo: ChatGptLogo,
    Icon: IconProviderOpenai,
    wellKnownOAuthClient: WellKnownOAuthClient.CHATGPT,
  },
  {
    id: 'claude',
    name: msg`Claude`,
    description: msg`Work with your Twenty workspace from Claude through the Twenty connector.`,
    logo: ClaudeLogo,
    Icon: IconModelClaude,
    wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
  },
];
