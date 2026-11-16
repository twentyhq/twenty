import { isDefined } from 'twenty-shared/utils';

export const formatRelationColumnLabel = ({
  relationLabel,
  targetLabel,
}: {
  relationLabel: string;
  targetLabel?: string;
}) =>
  isDefined(targetLabel) ? `${relationLabel} › ${targetLabel}` : relationLabel;
