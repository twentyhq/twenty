import { type TimelineProjectionRule } from '@/settings/timeline/types/TimelineProjectionRule';

export type TimelineProjectionRuleRow = {
  id: string;
  sourceLabel: string;
  activitiesLabel: string;
};

export const buildTimelineProjectionRuleRows = ({
  rules,
  anchorObjectMetadataId,
  labelByObjectMetadataId,
  unknownLabel,
}: {
  rules: TimelineProjectionRule[];
  anchorObjectMetadataId: string;
  labelByObjectMetadataId: Map<string, string>;
  unknownLabel: string;
}): TimelineProjectionRuleRow[] =>
  rules
    .filter((rule) => rule.anchorObjectMetadataId === anchorObjectMetadataId)
    .map((rule) => ({
      id: rule.id,
      sourceLabel:
        labelByObjectMetadataId.get(rule.sourceObjectMetadataId) ??
        unknownLabel,
      activitiesLabel: rule.linkedObjectMetadataIds
        .map((id) => labelByObjectMetadataId.get(id) ?? unknownLabel)
        .join(', '),
    }));
