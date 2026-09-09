// a file name is member-controlled: a code span keeps Slack from rendering
// markdown links or mrkdwn mentions the app would then appear to author
export const formatSlackFileNameAsCode = (fileName: string): string =>
  `\`${fileName.replace(/[`<>]/g, '')}\``;
