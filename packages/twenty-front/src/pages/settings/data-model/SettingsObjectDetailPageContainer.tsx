import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { AppPath } from '@/types/AppPath';
import { isDefined } from 'twenty-ui';
import { SettingsObjectDetailPage } from '~/pages/settings/data-model/SettingsObjectDetailPage';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const SETTINGS_OBJECT_DETAIL_TABLE_METADATA = {
  tableId: 'settingsObjectDetail',
  fields: [
    {
      fieldLabel: 'Name',
      fieldName: 'label',
      fieldType: 'string',
    },
    {
      fieldLabel: 'Field type',
      fieldName: 'fieldType',
      fieldType: 'string',
    },
    {
      fieldLabel: 'Data type',
      fieldName: 'dataType',
      fieldType: 'string',
    },
  ],
};

export const SettingsObjectDetailPageContainer = () => {
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
    <SettingsObjectDetailPage objectMetadataItem={activeObjectMetadataItem} />
  );
};
