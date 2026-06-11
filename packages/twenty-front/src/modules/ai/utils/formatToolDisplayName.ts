export const formatToolDisplayName = (toolName: string): string => {
  const displayName = toolName.replace(/_/g, ' ');

  return displayName.charAt(0).toUpperCase() + displayName.slice(1);
};
