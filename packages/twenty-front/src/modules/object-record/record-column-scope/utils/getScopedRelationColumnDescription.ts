import { t } from '@lingui/core/macro';

export const getScopedRelationColumnDescription = (relationLabel: string) =>
  t`Built in this view from ${relationLabel}. Can't be sorted or filtered.`;
