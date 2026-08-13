export type SlackLinkUnfurlResult = {
  ok: boolean;
  skipped?: string;
  error?: string;
  unfurledLinkCount?: number;
};
