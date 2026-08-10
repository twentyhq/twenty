export type SlackRecordField = {
  label: string;
  value: string;
};

export type SlackRecordDetails = {
  fields: SlackRecordField[];
  imageUrl?: string;
};
