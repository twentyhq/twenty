export const formatSlackFileNameAsCode = (fileName: string): string =>
  `\`${fileName.replace(/[`<>]/g, '')}\``;
