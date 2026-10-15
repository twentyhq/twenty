import { type AppLocale } from 'twenty-shared/translations';

export type ApplicationTranslationSyncAction = {
  type: 'create' | 'update' | 'delete';
  metadataName: 'applicationTranslation';
  locale: AppLocale;
  diff: Record<string, { before: string | null; after: string | null }>;
};
