import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { RecordTableActionBar } from '@/ui/object/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableContextMenu } from '@/ui/object/record-table/context-menu/components/RecordTableContextMenu';

import { useCreateOneObjectRecord } from '../hooks/useCreateOneObjectRecord';

import { RecordTableContainer } from './RecordTableContainer';

const StyledTableContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export type RecordTablePageProps = Pick<
  ObjectMetadataItemIdentifier,
  'objectNamePlural'
>;

export const RecordTablePage = () => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { objectNotFoundInMetadata, objectMetadataItem } =
    useObjectMetadataItem({
      objectNamePlural,
    });

  const navigate = useNavigate();

  useEffect(() => {
    if (objectNotFoundInMetadata) {
      navigate('/');
    }
  }, [objectNotFoundInMetadata, navigate]);

  const { createOneObject } = useCreateOneObjectRecord({
    objectNameSingular: objectMetadataItem?.nameSingular,
  });

  const handleAddButtonClick = async () => {
    await createOneObject?.({});
  };

  return (
    <PageContainer>
      <PageHeader title="Objects" Icon={IconBuildingSkyscraper}>
        <PageHotkeysEffect onAddButtonClick={handleAddButtonClick} />
        <PageAddButton onClick={handleAddButtonClick} />
      </PageHeader>
      <PageBody>
        <StyledTableContainer>
          <RecordTableContainer objectNamePlural={objectNamePlural} />
        </StyledTableContainer>
        <RecordTableActionBar />
        <RecordTableContextMenu />
      </PageBody>
    </PageContainer>
  );
};
