// Covers bare URLs, markdown [label](url) and Slack mrkdwn <url|label>.
export const extractHttpUrls = (text: string): string[] =>
  [...text.matchAll(/https?:\/\/[^\s<>|)\]]+/g)].map((match) =>
    match[0].replace(/[.,;:!?]+$/, ''),
  );
