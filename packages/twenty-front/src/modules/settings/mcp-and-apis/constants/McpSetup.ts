export const MCP_SETUP = {
  chatGptTwentyAppUrl:
    'https://chatgpt.com/apps/twenty/asdk_app_6a0ac8d7e28c8191a58ea65bb0ca3d5c',
  tooltipIds: {
    claudeInstallDisabled: 'mcp-claude-install-disabled',
    replitInstallDisabled: 'mcp-replit-install-disabled',
  },
  authorizationHeader: {
    key: 'Authorization',
    value: 'Bearer <YOUR_API_KEY>',
  },
  server: {
    name: 'twenty',
    displayName: 'Twenty',
  },
  clientDocsUrls: {
    augment: 'https://docs.augmentcode.com/setup-augment/mcp',
    amazonQ:
      'https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/qdev-mcp.html',
    cline: 'https://docs.cline.bot/mcp/mcp-overview',
    geminiCli: 'https://geminicli.com/docs/tools/mcp-server/',
    jetbrains: 'https://www.jetbrains.com/help/ai-assistant/mcp.html',
    libreChat: 'https://www.librechat.ai/docs/features/mcp',
    lmStudio: 'https://lmstudio.ai/docs/app/mcp',
    raycast: 'https://manual.raycast.com/ai/model-context-protocol',
    warp: 'https://docs.warp.dev/agent-platform/capabilities/mcp/',
    windsurf: 'https://docs.devin.ai/desktop/cascade/mcp',
    zed: 'https://zed.dev/docs/ai/mcp',
  },
} as const;
