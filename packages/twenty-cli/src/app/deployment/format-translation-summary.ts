import { type AppTranslationPlanAction } from '@/app/deployment/types/app-plan.type';

export const formatTranslationSummary = (actions: AppTranslationPlanAction[]) =>
  `Translations: ${actions
    .map((action) => {
      const count = Object.keys(action.diff).length;
      const operation =
        action.type === 'create'
          ? 'added'
          : action.type === 'delete'
            ? 'removed'
            : 'changed';
      return `${action.locale} ${operation} (${count} ${count === 1 ? 'string' : 'strings'})`;
    })
    .join(', ')}.`;
