import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isDefined, AppPath } from 'twenty-ui';
import { SettingsObjectDetailPageContent } from '~/pages/settings/data-model/SettingsObjectDetailPageContent';

export const SettingsObjectDetailPage = () => {
  const navigate = useNavigate();

  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  useEffect(() => {
    if (!activeObjectMetadataItem) navigate(AppPath.NotFound);
  }, [activeObjectMetadataItem, navigate]);

  if (!isDefined(activeObjectMetadataItem)) return <></>;

  return (
    <SettingsObjectDetailPageContent
      objectMetadataItem={activeObjectMetadataItem}
    />
  );
};
