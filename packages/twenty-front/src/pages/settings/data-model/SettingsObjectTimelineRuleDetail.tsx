import { useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsObjectTimelineRuleForm } from '@/settings/timeline/components/SettingsObjectTimelineRuleForm';
import { useTimelineProjectionRules } from '@/settings/timeline/hooks/useTimelineProjectionRules';
import { isDefined } from 'twenty-shared/utils';

export const SettingsObjectTimelineRuleDetail = () => {
  const { objectNamePlural = '', timelineProjectionRuleId = '' } = useParams();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const { rules, loading } = useTimelineProjectionRules();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const rule = rules.find(
    (candidate) => candidate.id === timelineProjectionRuleId,
  );

  if (loading || !isDefined(objectMetadataItem) || !isDefined(rule)) {
    return null;
  }

  return (
    <SettingsObjectTimelineRuleForm
      objectMetadataItem={objectMetadataItem}
      rule={rule}
    />
  );
};
