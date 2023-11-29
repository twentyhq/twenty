import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
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

import { useCreateOneRecord } from '../hooks/useCreateOneRecord';

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

  const { objectMetadataItemNotFound, objectMetadataItem } =
    useObjectMetadataItem({
      objectNamePlural,
    });

  const onboardingStatus = useOnboardingStatus();

  const navigate = useNavigate();

  useEffect(() => {
    if (
      objectMetadataItemNotFound &&
      onboardingStatus === OnboardingStatus.Completed
    ) {
      navigate('/');
    }
  }, [objectMetadataItemNotFound, navigate, onboardingStatus]);

  const { createOneRecord: createOneObject } = useCreateOneRecord({
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
