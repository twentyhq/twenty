export type SlackRecordUnfurlCardField = {
  label: string;
  value: string;
};

export type SlackRecordUnfurlCard = {
  recordTitle: string;
  objectLabel: string;
  fields: SlackRecordUnfurlCardField[];
};
