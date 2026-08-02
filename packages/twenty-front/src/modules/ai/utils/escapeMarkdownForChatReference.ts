export const escapeMarkdownForChatReference = (displayName: string): string =>
  displayName.replace(/([\\`*_{}[\]()#+\-.!|~>])/g, '\\$1');
