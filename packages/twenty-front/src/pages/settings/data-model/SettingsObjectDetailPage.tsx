import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AppPath } from '@/types/AppPath';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { SettingsObjectDetailPageContent } from '~/pages/settings/data-model/SettingsObjectDetailPageContent';
import { updatedObjectSlugState } from '~/pages/settings/data-model/states/updatedObjectSlugState';

export const SettingsObjectDetailPage = () => {
  const navigate = useNavigate();
  const [updatedObjectSlug, setUpdatedObjectSlug] = useRecoilState(
    updatedObjectSlugState,
  );

  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  const updatedActiveObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(updatedObjectSlug);

  useEffect(() => {
    if (objectSlug === updatedObjectSlug) setUpdatedObjectSlug('');
    if (!activeObjectMetadataItem && !updatedActiveObjectMetadataItem)
      navigate(AppPath.NotFound);
  }, [
    activeObjectMetadataItem,
    navigate,
    updatedActiveObjectMetadataItem,
    objectSlug,
    updatedObjectSlug,
    setUpdatedObjectSlug,
  ]);

  if (
    !isDefined(activeObjectMetadataItem) &&
    !isDefined(updatedActiveObjectMetadataItem)
  )
    return <></>;

  return (
    <SettingsObjectDetailPageContent
      objectMetadataItem={
        activeObjectMetadataItem ||
        (updatedActiveObjectMetadataItem as ObjectMetadataItem)
      }
    />
  );
};
