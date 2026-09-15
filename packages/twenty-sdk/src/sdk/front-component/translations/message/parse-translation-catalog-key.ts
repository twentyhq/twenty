import { CONTEXT_SEPARATOR } from './context-separator.constant';
import { type MessageDescriptor } from './message-descriptor.type';

export const parseTranslationCatalogKey = (key: string): MessageDescriptor => {
  const separatorIndex = key.indexOf(CONTEXT_SEPARATOR);

  if (separatorIndex === -1) {
    return { message: key };
  }

  return {
    context: key.slice(0, separatorIndex),
    message: key.slice(separatorIndex + 1),
  };
};
