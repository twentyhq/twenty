import { type NonReadableViewFieldInfo } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getNonReadableViewFieldSubTitle = (
  nonReadableViewFieldInfo: NonReadableViewFieldInfo,
): string => {
  const usageLabel =
    nonReadableViewFieldInfo.usage === 'sort' ? t`sorting` : t`filtering`;

  if (isDefined(nonReadableViewFieldInfo.fieldLabel)) {
    return t`This view uses ${usageLabel} on field "${nonReadableViewFieldInfo.fieldLabel}" on "${nonReadableViewFieldInfo.objectLabel}" which is not accessible.`;
  }

  return t`This view uses ${usageLabel} on object "${nonReadableViewFieldInfo.objectLabel}" which is not accessible.`;
};
