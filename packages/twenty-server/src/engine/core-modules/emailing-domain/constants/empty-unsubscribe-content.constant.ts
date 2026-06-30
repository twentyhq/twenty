import { type UnsubscribeContent } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-content.type';

export const EMPTY_UNSUBSCRIBE_CONTENT: UnsubscribeContent = {
  headers: [],
  textFooter: '',
  htmlFooter: '',
};
