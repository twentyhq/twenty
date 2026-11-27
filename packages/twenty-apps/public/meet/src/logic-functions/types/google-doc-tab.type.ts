import { type GoogleDocLists } from 'src/logic-functions/types/google-doc-lists.type';
import { type GoogleDocParagraph } from 'src/logic-functions/types/google-doc-paragraph.type';

export type GoogleDocTab = {
  tabProperties?: { title?: string };
  documentTab?: {
    body?: { content?: { paragraph?: GoogleDocParagraph }[] };
    lists?: GoogleDocLists;
  };
};
