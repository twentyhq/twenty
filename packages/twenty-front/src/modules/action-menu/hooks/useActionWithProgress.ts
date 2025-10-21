import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { computeProgressText } from '@/action-menu/utils/computeProgressText';
import { type ObjectRecordQueryProgress } from '@/object-record/types/ObjectRecordQueryProgress';
import { useContext, useMemo } from 'react';

export const useActionWithProgress = (progress?: ObjectRecordQueryProgress) => {
  const actionConfig = useContext(ActionConfigContext);

  const actionConfigWithProgress = useMemo(() => {
    if (!actionConfig) return null;

    const originalLabel =
      typeof actionConfig.label === 'string'
        ? actionConfig.label
        : actionConfig.label?.message || '';

    const originalShortLabel =
      typeof actionConfig.shortLabel === 'string'
        ? actionConfig.shortLabel
        : actionConfig.shortLabel?.message || '';

    const progressText = computeProgressText(progress);

    return {
      ...actionConfig,
      label: `${originalLabel}${progressText}`,
      shortLabel: `${originalShortLabel}${progressText}`,
    };
  }, [actionConfig, progress]);

  return { actionConfigWithProgress };
};
