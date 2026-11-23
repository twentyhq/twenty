export type GoogleDocParagraphElement = {
  textRun?: {
    content?: string;
    textStyle?: { bold?: boolean; italic?: boolean; link?: { url?: string } };
  };
  person?: { personProperties?: { name?: string; email?: string } };
  richLink?: { richLinkProperties?: { title?: string; uri?: string } };
};
