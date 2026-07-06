import { t } from '@lingui/core/macro';

import AmazonQLogo from '@/settings/mcp-and-apis/assets/mcp-clients/amazon-q.svg';
import AugmentCodeLogo from '@/settings/mcp-and-apis/assets/mcp-clients/augment-code.svg';
import ClaudeLogo from '@/settings/mcp-and-apis/assets/mcp-clients/claude-color.png';
import ClineLogo from '@/settings/mcp-and-apis/assets/mcp-clients/cline.svg';
import CursorLogo from '@/settings/mcp-and-apis/assets/mcp-clients/cursor.svg';
import GeminiCliLogo from '@/settings/mcp-and-apis/assets/mcp-clients/gemini-cli.svg';
import GooseLogo from '@/settings/mcp-and-apis/assets/mcp-clients/goose.svg';
import JetBrainsLogo from '@/settings/mcp-and-apis/assets/mcp-clients/jetbrains.svg';
import LibreChatLogo from '@/settings/mcp-and-apis/assets/mcp-clients/librechat.svg';
import LmStudioLogo from '@/settings/mcp-and-apis/assets/mcp-clients/lm-studio.svg';
import OpenAiLogo from '@/settings/mcp-and-apis/assets/mcp-clients/openai.svg';
import RaycastLogo from '@/settings/mcp-and-apis/assets/mcp-clients/raycast.svg';
import ReplitLogo from '@/settings/mcp-and-apis/assets/mcp-clients/replit.svg';
import VsCodeLogo from '@/settings/mcp-and-apis/assets/mcp-clients/vs-code.svg';
import WarpLogo from '@/settings/mcp-and-apis/assets/mcp-clients/warp.svg';
import WindsurfLogo from '@/settings/mcp-and-apis/assets/mcp-clients/windsurf.svg';
import ZedLogo from '@/settings/mcp-and-apis/assets/mcp-clients/zed.svg';
import { McpClientLogo } from '@/settings/mcp-and-apis/components/McpClientLogo';
import { MCP_SETUP } from '@/settings/mcp-and-apis/constants/McpSetup';
import { type McpSetupCategory } from '@/settings/mcp-and-apis/types/McpSetup';
import {
  buildClaudeInstallLink,
  buildCursorInstallLink,
  buildGooseInstallLink,
  buildLmStudioInstallLink,
  buildReplitInstallLink,
  buildVsCodeInstallLink,
} from '@/settings/mcp-and-apis/utils/mcpSetup';

type BuildMcpSetupCategoriesParams = {
  isHttpsInstallLinkEnabled: boolean;
  mcpServerUrl: string;
};

export const buildMcpSetupCategories = ({
  isHttpsInstallLinkEnabled,
  mcpServerUrl,
}: BuildMcpSetupCategoriesParams): McpSetupCategory[] => [
  {
    title: t`Quick install`,
    description: t`Open a maintained integration or prefill clients that accept MCP install links.`,
    showManualConfigurationAfter: true,
    cards: [
      {
        title: t`ChatGPT`,
        badge: t`Official app`,
        description: t`Open Twenty's official ChatGPT integration for your workspace.`,
        ctaLabel: t`Open`,
        href: MCP_SETUP.chatGptTwentyAppUrl,
        logo: <McpClientLogo src={OpenAiLogo} invertInDarkMode />,
      },
      {
        title: t`Claude`,
        badge: t`Preset link`,
        description: t`Open Claude with the Twenty connector name and MCP URL prefilled.`,
        ctaLabel: t`Install`,
        disabledTooltip: t`Claude install links require an HTTPS MCP URL.`,
        href: isHttpsInstallLinkEnabled
          ? buildClaudeInstallLink(mcpServerUrl)
          : undefined,
        isDisabled: !isHttpsInstallLinkEnabled,
        logo: <McpClientLogo src={ClaudeLogo} />,
        tooltipId: MCP_SETUP.tooltipIds.claudeInstallDisabled,
      },
    ],
  },
  {
    title: t`Other clients`,
    description: t`Connect additional MCP clients using install links or client docs.`,
    cards: [
      {
        title: t`Cursor`,
        badge: t`Install link`,
        description: t`Open Cursor's MCP installer with the Twenty remote server config.`,
        ctaLabel: t`Install`,
        href: buildCursorInstallLink(mcpServerUrl),
        logo: <McpClientLogo src={CursorLogo} invertInDarkMode />,
      },
      {
        title: t`VS Code`,
        badge: t`Install link`,
        description: t`Install the remote MCP server into a VS Code profile.`,
        ctaLabel: t`Install`,
        href: buildVsCodeInstallLink(mcpServerUrl),
        logo: <McpClientLogo src={VsCodeLogo} />,
      },
      {
        title: t`Goose`,
        badge: t`Install link`,
        description: t`Add Twenty as a Streamable HTTP extension in Goose.`,
        ctaLabel: t`Install`,
        href: buildGooseInstallLink(mcpServerUrl),
        logo: <McpClientLogo src={GooseLogo} invertInDarkMode />,
      },
      {
        title: t`Replit Agent`,
        badge: t`Install link`,
        description: t`Open Replit with the Twenty remote server config.`,
        ctaLabel: t`Install`,
        disabledTooltip: t`Replit install links require an HTTPS MCP URL.`,
        href: isHttpsInstallLinkEnabled
          ? buildReplitInstallLink(mcpServerUrl)
          : undefined,
        isDisabled: !isHttpsInstallLinkEnabled,
        logo: <McpClientLogo src={ReplitLogo} />,
        tooltipId: MCP_SETUP.tooltipIds.replitInstallDisabled,
      },
      {
        title: t`LM Studio`,
        badge: t`Install link`,
        description: t`Add the Twenty remote server with LM Studio's install link.`,
        ctaLabel: t`Install`,
        href: buildLmStudioInstallLink(mcpServerUrl),
        logo: <McpClientLogo src={LmStudioLogo} invertInDarkMode />,
      },
      {
        title: t`Cline`,
        badge: t`Manual`,
        description: t`Configure the Twenty MCP server manually in Cline.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.cline,
        logo: <McpClientLogo src={ClineLogo} invertInDarkMode />,
      },
      {
        title: t`Zed`,
        badge: t`Manual`,
        description: t`Add the Twenty MCP server as a remote context server in Zed.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.zed,
        logo: <McpClientLogo src={ZedLogo} />,
      },
      {
        title: t`Windsurf / Cascade`,
        badge: t`Manual`,
        description: t`Configure the Twenty MCP server manually in Cascade.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.windsurf,
        logo: <McpClientLogo src={WindsurfLogo} invertInDarkMode />,
      },
      {
        title: t`Raycast`,
        badge: t`Settings`,
        description: t`Add the Twenty MCP server from Raycast's MCP commands or settings.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.raycast,
        logo: <McpClientLogo src={RaycastLogo} />,
      },
      {
        title: t`Warp`,
        badge: t`Settings`,
        description: t`Configure the remote MCP server through Warp's agent settings.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.warp,
        logo: <McpClientLogo src={WarpLogo} />,
      },
      {
        title: t`JetBrains AI / Junie`,
        badge: t`Settings`,
        description: t`Import or add the MCP configuration from JetBrains settings.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.jetbrains,
        logo: <McpClientLogo src={JetBrainsLogo} invertInDarkMode />,
      },
      {
        title: t`Gemini CLI`,
        badge: t`CLI config`,
        description: t`Add the Twenty MCP server in Gemini CLI settings.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.geminiCli,
        logo: <McpClientLogo src={GeminiCliLogo} />,
      },
      {
        title: t`Amazon Q Developer CLI`,
        badge: t`CLI config`,
        description: t`Configure the remote server in Amazon Q Developer's MCP settings.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.amazonQ,
        logo: <McpClientLogo src={AmazonQLogo} />,
      },
      {
        title: t`LibreChat`,
        badge: t`YAML config`,
        description: t`Add the Twenty MCP server to your LibreChat configuration file.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.libreChat,
        logo: <McpClientLogo src={LibreChatLogo} />,
      },
      {
        title: t`Augment Code`,
        badge: t`Settings`,
        description: t`Add the Twenty MCP server from Augment Code settings.`,
        ctaLabel: t`Docs`,
        href: MCP_SETUP.clientDocsUrls.augment,
        logo: <McpClientLogo src={AugmentCodeLogo} invertInDarkMode />,
      },
    ],
  },
];
