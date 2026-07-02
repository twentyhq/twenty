import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment, type ReactNode, useState } from 'react';

import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import AmazonQLogo from '@/settings/playground/assets/mcp-clients/amazon-q.svg';
import AugmentCodeLogo from '@/settings/playground/assets/mcp-clients/augment-code.svg';
import ClineLogo from '@/settings/playground/assets/mcp-clients/cline.svg';
import CursorLogo from '@/settings/playground/assets/mcp-clients/cursor.svg';
import GeminiCliLogo from '@/settings/playground/assets/mcp-clients/gemini-cli.svg';
import GooseLogo from '@/settings/playground/assets/mcp-clients/goose.svg';
import JetBrainsLogo from '@/settings/playground/assets/mcp-clients/jetbrains.svg';
import LibreChatLogo from '@/settings/playground/assets/mcp-clients/librechat.svg';
import LmStudioLogo from '@/settings/playground/assets/mcp-clients/lm-studio.svg';
import RaycastLogo from '@/settings/playground/assets/mcp-clients/raycast.svg';
import ReplitLogo from '@/settings/playground/assets/mcp-clients/replit.svg';
import VsCodeLogo from '@/settings/playground/assets/mcp-clients/vs-code.svg';
import WarpLogo from '@/settings/playground/assets/mcp-clients/warp.svg';
import WindsurfLogo from '@/settings/playground/assets/mcp-clients/windsurf.svg';
import ZedLogo from '@/settings/playground/assets/mcp-clients/zed.svg';
import ModelContextProtocolLogo from '@/settings/playground/assets/model-context-protocol-logo.svg?react';
import {
  IconExternalLink,
  IconModelClaude,
  IconProviderOpenai,
} from 'twenty-ui/icon';
import { CodeEditor, CoreEditorHeader } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type McpSetupCard = {
  badge: string;
  ctaLabel: string;
  description: string;
  disabledTooltip?: string;
  href?: string;
  isDisabled?: boolean;
  logo: ReactNode;
  title: string;
  tooltipId?: string;
};

type McpSetupCategory = {
  cards: McpSetupCard[];
  description: string;
  showManualConfigurationAfter?: boolean;
  title: string;
};

const CHATGPT_TWENTY_APP_URL =
  'https://chatgpt.com/apps/twenty/asdk_app_6a0ac8d7e28c8191a58ea65bb0ca3d5c';

const CLAUDE_INSTALL_DISABLED_TOOLTIP_ID = 'mcp-claude-install-disabled';
const MCP_SERVER_NAME = 'twenty';
const MCP_SERVER_DISPLAY_NAME = 'Twenty';

const CLIENT_DOCS_URLS = {
  augment: 'https://docs.augmentcode.com/setup-augment/mcp',
  amazonQ:
    'https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/qdev-mcp.html',
  cline: 'https://docs.cline.bot/mcp/mcp-overview',
  geminiCli: 'https://geminicli.com/docs/tools/mcp-server/',
  jetbrains: 'https://www.jetbrains.com/help/ai-assistant/mcp.html',
  libreChat: 'https://www.librechat.ai/docs/features/mcp',
  lmStudio: 'https://lmstudio.ai/docs/app/mcp',
  raycast: 'https://manual.raycast.com/ai/model-context-protocol',
  replit: 'https://docs.replit.com/references/mcp/overview',
  warp: 'https://docs.warp.dev/agent-platform/capabilities/mcp/',
  windsurf: 'https://docs.devin.ai/desktop/cascade/mcp',
  zed: 'https://zed.dev/docs/ai/mcp',
} as const;

const buildMcpServerUrl = (serverBaseUrl: string) =>
  `${serverBaseUrl.replace(/\/+$/, '')}/mcp`;

const isHttpsUrl = (url: string) => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

const buildRemoteMcpServerConfig = (mcpServerUrl: string) => ({
  url: mcpServerUrl,
});

const buildMcpConfig = (mcpServerUrl: string) =>
  `{
  "mcpServers": {
    "twenty": {
      "url": "${mcpServerUrl}",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}`;

const buildClaudeInstallLink = (mcpServerUrl: string) => {
  const params = new URLSearchParams({
    modal: 'add-custom-connector',
    connectorName: 'Twenty',
    connectorUrl: mcpServerUrl,
  });

  return `https://claude.ai/customize/connectors?${params.toString()}`;
};

const buildCursorInstallLink = (mcpServerUrl: string) => {
  const config = btoa(JSON.stringify(buildRemoteMcpServerConfig(mcpServerUrl)));

  const params = new URLSearchParams({
    name: MCP_SERVER_NAME,
    config,
  });

  return `cursor://anysphere.cursor-deeplink/mcp/install?${params.toString()}`;
};

const buildVsCodeInstallLink = (mcpServerUrl: string) =>
  `vscode:mcp/install?${encodeURIComponent(
    JSON.stringify({
      name: MCP_SERVER_NAME,
      type: 'http',
      url: mcpServerUrl,
    }),
  )}`;

const buildGooseInstallLink = (mcpServerUrl: string) => {
  const params = new URLSearchParams({
    url: mcpServerUrl,
    type: 'streamable_http',
    timeout: '300',
    id: 'twenty',
    name: 'Twenty',
    description: 'Access your Twenty workspace through MCP',
  });

  return `goose://extension?${params.toString()}`;
};

const buildReplitInstallLink = (mcpServerUrl: string) => {
  const payload = btoa(
    JSON.stringify({
      displayName: MCP_SERVER_DISPLAY_NAME,
      baseUrl: mcpServerUrl,
    }),
  );

  const params = new URLSearchParams({
    mcp: payload,
  });

  return `https://replit.com/integrations?${params.toString()}`;
};

const buildLmStudioInstallLink = (mcpServerUrl: string) => {
  const config = btoa(JSON.stringify(buildRemoteMcpServerConfig(mcpServerUrl)));

  const params = new URLSearchParams({
    name: MCP_SERVER_NAME,
    config,
  });

  return `lmstudio://add_mcp?${params.toString()}`;
};

const StyledMcpEditorHeaderTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMcpIcon = styled(ModelContextProtocolLogo)`
  color: inherit;
  flex-shrink: 0;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

const StyledMcpSetupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[10]};
`;

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledSetupCard = styled.article`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 102px;
  min-width: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]};
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledCardLogo = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 0 0 32px;
  height: 32px;
  justify-content: center;
  overflow: visible;
  width: 32px;

  > svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`;

const StyledLogoImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;

  .dark &.dark-mode-invert {
    filter: invert(1);
  }
`;

const StyledOpenAiLogo = styled.div`
  display: flex;
  height: 100%;
  width: 100%;

  > svg {
    display: block;
    height: 100%;
    transform: scale(1.25);
    transform-origin: center;
    width: 100%;
  }
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-width: 0;
`;

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledCardTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCardBadge = styled.div`
  color: ${themeCssVariables.font.color.light};
  flex: 1 1 auto;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCardDescription = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  overflow: hidden;
`;

const StyledInstallAction = styled.a`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex: 0 0 auto;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding: 0 ${themeCssVariables.spacing[2]};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &[aria-disabled='true'] {
    color: ${themeCssVariables.font.color.light};
    cursor: not-allowed;
  }

  &[aria-disabled='true']:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

export const SettingsMcpSetup = () => {
  const { t } = useLingui();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const mcpServerUrl = buildMcpServerUrl(REACT_APP_SERVER_BASE_URL);
  const isClaudeInstallLinkEnabled = isHttpsUrl(mcpServerUrl);
  const mcpConfig = buildMcpConfig(mcpServerUrl);
  const renderLogoImage = (
    src: string,
    options?: { invertInDarkMode?: boolean },
  ) => (
    <StyledLogoImage
      src={src}
      alt=""
      className={options?.invertInDarkMode ? 'dark-mode-invert' : undefined}
    />
  );

  const categories: McpSetupCategory[] = [
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
          href: CHATGPT_TWENTY_APP_URL,
          logo: (
            <StyledOpenAiLogo>
              <IconProviderOpenai />
            </StyledOpenAiLogo>
          ),
        },
        {
          title: t`Claude`,
          badge: t`Preset link`,
          description: t`Open Claude with the Twenty connector name and MCP URL prefilled.`,
          ctaLabel: t`Install`,
          disabledTooltip: t`Claude install links require an HTTPS MCP URL.`,
          href: isClaudeInstallLinkEnabled
            ? buildClaudeInstallLink(mcpServerUrl)
            : undefined,
          isDisabled: !isClaudeInstallLinkEnabled,
          logo: <IconModelClaude size={24} />,
          tooltipId: CLAUDE_INSTALL_DISABLED_TOOLTIP_ID,
        },
        {
          title: t`Cursor`,
          badge: t`Install link`,
          description: t`Open Cursor's MCP installer with the Twenty remote server config.`,
          ctaLabel: t`Install`,
          href: buildCursorInstallLink(mcpServerUrl),
          logo: renderLogoImage(CursorLogo, { invertInDarkMode: true }),
        },
        {
          title: t`VS Code`,
          badge: t`Install link`,
          description: t`Install the remote MCP server into a VS Code profile.`,
          ctaLabel: t`Install`,
          href: buildVsCodeInstallLink(mcpServerUrl),
          logo: renderLogoImage(VsCodeLogo),
        },
        {
          title: t`Goose`,
          badge: t`Install link`,
          description: t`Add Twenty as a Streamable HTTP extension in Goose.`,
          ctaLabel: t`Install`,
          href: buildGooseInstallLink(mcpServerUrl),
          logo: renderLogoImage(GooseLogo, { invertInDarkMode: true }),
        },
        {
          title: t`Replit Agent`,
          badge: t`Install link`,
          description: t`Open Replit with the Twenty remote server config.`,
          ctaLabel: t`Install`,
          href: buildReplitInstallLink(mcpServerUrl),
          logo: renderLogoImage(ReplitLogo),
        },
        {
          title: t`LM Studio`,
          badge: t`Install link`,
          description: t`Add the Twenty remote server with LM Studio's install link.`,
          ctaLabel: t`Install`,
          href: buildLmStudioInstallLink(mcpServerUrl),
          logo: renderLogoImage(LmStudioLogo, { invertInDarkMode: true }),
        },
      ],
    },
    {
      title: t`Other manual clients`,
      description: t`Follow client docs to connect your MCP manually.`,
      cards: [
        {
          title: t`Cline`,
          badge: t`Manual`,
          description: t`Configure the Twenty MCP server manually in Cline.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.cline,
          logo: renderLogoImage(ClineLogo, { invertInDarkMode: true }),
        },
        {
          title: t`Zed`,
          badge: t`Manual`,
          description: t`Add the Twenty MCP server as a remote context server in Zed.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.zed,
          logo: renderLogoImage(ZedLogo),
        },
        {
          title: t`Windsurf / Cascade`,
          badge: t`Manual`,
          description: t`Configure the Twenty MCP server manually in Cascade.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.windsurf,
          logo: renderLogoImage(WindsurfLogo, { invertInDarkMode: true }),
        },
        {
          title: t`Raycast`,
          badge: t`Settings`,
          description: t`Add the Twenty MCP server from Raycast's MCP commands or settings.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.raycast,
          logo: renderLogoImage(RaycastLogo),
        },
        {
          title: t`Warp`,
          badge: t`Settings`,
          description: t`Configure the remote MCP server through Warp's agent settings.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.warp,
          logo: renderLogoImage(WarpLogo),
        },
        {
          title: t`JetBrains AI / Junie`,
          badge: t`Settings`,
          description: t`Import or add the MCP configuration from JetBrains settings.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.jetbrains,
          logo: renderLogoImage(JetBrainsLogo, { invertInDarkMode: true }),
        },
        {
          title: t`Gemini CLI`,
          badge: t`CLI config`,
          description: t`Add the Twenty MCP server in Gemini CLI settings.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.geminiCli,
          logo: renderLogoImage(GeminiCliLogo),
        },
        {
          title: t`Amazon Q Developer CLI`,
          badge: t`CLI config`,
          description: t`Configure the remote server in Amazon Q Developer's MCP settings.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.amazonQ,
          logo: renderLogoImage(AmazonQLogo),
        },
        {
          title: t`LibreChat`,
          badge: t`YAML config`,
          description: t`Add the Twenty MCP server to your LibreChat configuration file.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.libreChat,
          logo: renderLogoImage(LibreChatLogo),
        },
        {
          title: t`Augment Code`,
          badge: t`Settings`,
          description: t`Add the Twenty MCP server from Augment Code settings.`,
          ctaLabel: t`Docs`,
          href: CLIENT_DOCS_URLS.augment,
          logo: renderLogoImage(AugmentCodeLogo, { invertInDarkMode: true }),
        },
      ],
    },
  ];

  return (
    <StyledMcpSetupContainer>
      {categories.map((category) => (
        <Fragment key={category.title}>
          <Section>
            <H2Title
              title={category.title}
              description={category.description}
            />
            <StyledCardsGrid>
              {category.cards.map((card) => (
                <StyledSetupCard key={card.title}>
                  <StyledCardLogo aria-hidden>{card.logo}</StyledCardLogo>
                  <StyledCardContent>
                    <StyledCardHeader>
                      <StyledCardTitle>{card.title}</StyledCardTitle>
                      <StyledCardBadge>{card.badge}</StyledCardBadge>
                      {(card.href || card.isDisabled) && (
                        <>
                          <StyledInstallAction
                            aria-disabled={card.isDisabled || undefined}
                            data-tooltip-id={
                              card.isDisabled && card.disabledTooltip
                                ? card.tooltipId
                                : undefined
                            }
                            href={card.isDisabled ? undefined : card.href}
                            onBlur={
                              card.isDisabled
                                ? () => setActiveTooltipId(null)
                                : undefined
                            }
                            onClick={
                              card.isDisabled
                                ? (event) => {
                                    event.preventDefault();

                                    setActiveTooltipId(card.tooltipId ?? null);
                                  }
                                : undefined
                            }
                            onFocus={
                              card.isDisabled
                                ? () =>
                                    setActiveTooltipId(card.tooltipId ?? null)
                                : undefined
                            }
                            onMouseEnter={
                              card.isDisabled
                                ? () =>
                                    setActiveTooltipId(card.tooltipId ?? null)
                                : undefined
                            }
                            onMouseLeave={
                              card.isDisabled
                                ? () => setActiveTooltipId(null)
                                : undefined
                            }
                            rel={card.isDisabled ? undefined : 'noreferrer'}
                            role={card.isDisabled ? 'button' : undefined}
                            tabIndex={card.isDisabled ? 0 : undefined}
                            target={card.isDisabled ? undefined : '_blank'}
                          >
                            <IconExternalLink size={14} />
                            {card.ctaLabel}
                          </StyledInstallAction>
                          {card.isDisabled &&
                            card.disabledTooltip &&
                            card.tooltipId && (
                              <AppTooltip
                                anchorSelect={`[data-tooltip-id='${card.tooltipId}']`}
                                content={card.disabledTooltip}
                                delay={TooltipDelay.shortDelay}
                                isOpen={activeTooltipId === card.tooltipId}
                                noArrow
                                place="bottom"
                                positionStrategy="fixed"
                              />
                            )}
                        </>
                      )}
                    </StyledCardHeader>
                    <StyledCardDescription>
                      {card.description}
                    </StyledCardDescription>
                  </StyledCardContent>
                </StyledSetupCard>
              ))}
            </StyledCardsGrid>
          </Section>

          {category.showManualConfigurationAfter && (
            <Section>
              <H2Title
                title={t`Manual configuration`}
                description={t`Access your workspace data from your favorite MCP client like Claude, Codex or Cursor.`}
              />
              <CoreEditorHeader
                leftNodes={[
                  <StyledMcpEditorHeaderTitle>
                    <StyledMcpIcon aria-hidden />
                    <span>{t`MCP client configuration`}</span>
                  </StyledMcpEditorHeaderTitle>,
                ]}
                rightNodes={[<LightCopyIconButton copyText={mcpConfig} />]}
              />
              <CodeEditor
                value={mcpConfig}
                language="json"
                variant="with-header"
                contentPadding="comfortable"
                autoHeight
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  lineNumbers: 'off',
                  lineNumbersMinChars: 0,
                  folding: false,
                  glyphMargin: false,
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'none',
                  wordWrap: 'on',
                }}
              />
            </Section>
          )}
        </Fragment>
      ))}
    </StyledMcpSetupContainer>
  );
};
