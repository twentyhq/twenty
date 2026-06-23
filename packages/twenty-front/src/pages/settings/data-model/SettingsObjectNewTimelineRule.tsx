import { useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsObjectTimelineRuleForm } from '@/settings/timeline/components/SettingsObjectTimelineRuleForm';
import { isDefined } from 'twenty-shared/utils';

export const SettingsObjectNewTimelineRule = () => {
  const { objectNamePlural = '' } = useParams();

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <SettingsObjectTimelineRuleForm objectMetadataItem={objectMetadataItem} />
  );
};
