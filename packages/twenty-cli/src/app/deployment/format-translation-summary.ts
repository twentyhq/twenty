import { type AppTranslationPlanAction } from '@/app/deployment/types/app-plan.type';

const OPERATION_BY_TYPE = {
  create: 'added',
  delete: 'removed',
  update: 'changed',
};

export const formatTranslationSummary = (actions: AppTranslationPlanAction[]) =>
  `Translations: ${actions
    .map((action) => {
      const count = Object.keys(action.diff).length;
      const operation = OPERATION_BY_TYPE[action.type];
      return `${action.locale} ${operation} (${count} ${count === 1 ? 'string' : 'strings'})`;
    })
    .join(', ')}.`;
