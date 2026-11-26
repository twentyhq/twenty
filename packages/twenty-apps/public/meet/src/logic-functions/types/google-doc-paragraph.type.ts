import { type GoogleDocParagraphElement } from 'src/logic-functions/types/google-doc-paragraph-element.type';

export type GoogleDocParagraph = {
  elements?: GoogleDocParagraphElement[];
  paragraphStyle?: { namedStyleType?: string };
  bullet?: { listId: string; nestingLevel?: number };
};
