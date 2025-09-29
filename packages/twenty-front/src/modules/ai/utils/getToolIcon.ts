import { IconDatabase, IconMail, IconTool, IconWorld } from 'twenty-ui/display';

const TOOL_ICON_MAPPINGS = [
  {
    keywords: ['email'],
    icon: IconMail,
  },
  {
    keywords: ['http_request'],
    icon: IconWorld,
  },
  {
    keywords: ['create_', 'update_', 'find_', 'delete_'],
    icon: IconDatabase,
  },
  {
    keywords: ['workflow', 'handoff'],
    icon: IconTool,
  },
] as const;

export const getToolIcon = (toolName: string) => {
  const mapping = TOOL_ICON_MAPPINGS.find(({ keywords }) =>
    keywords.some((keyword) => toolName.includes(keyword)),
  );

  return mapping?.icon ?? IconTool;
};
