import { type GoogleDocTab } from 'src/logic-functions/types/google-doc-tab.type';

export type GoogleDoc = {
  title?: string;
  tabs?: GoogleDocTab[];
};
