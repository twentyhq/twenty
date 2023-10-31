import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { ObjectTable } from '@/metadata/components/RecordTable';
import { MetadataObjectIdentifier } from '@/metadata/types/MetadataObjectIdentifier';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { RecordTableActionBar } from '@/ui/object/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableContextMenu } from '@/ui/object/record-table/context-menu/components/RecordTableContextMenu';
import { TableRecoilScopeContext } from '@/ui/object/record-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { useCreateOneObject } from '../hooks/useCreateOneObject';
import { useFindOneMetadataObject } from '../hooks/useFindOneMetadataObject';
import { MetadataObjectScope } from '../scopes/MetadataObjectScope';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export type RecordTablePageProps = Pick<
  MetadataObjectIdentifier,
  'objectNamePlural'
>;

export const RecordTablePage = () => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { objectNotFoundInMetadata, loading } = useFindOneMetadataObject({
    objectNamePlural,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && objectNotFoundInMetadata) {
      navigate('/');
    }
  }, [objectNotFoundInMetadata, loading, navigate]);

  const { createOneObject } = useCreateOneObject({
    objectNamePlural,
  });

  const handleAddButtonClick = async () => {
    createOneObject?.({});
  };

  return (
    <PageContainer>
      <PageHeader title="Objects" Icon={IconBuildingSkyscraper}>
        <PageHotkeysEffect onAddButtonClick={handleAddButtonClick} />
        <PageAddButton onClick={handleAddButtonClick} />
      </PageHeader>
      <PageBody>
        <RecoilScope
          scopeId={objectNamePlural}
          CustomRecoilScopeContext={TableRecoilScopeContext}
        >
          <StyledTableContainer>
            <MetadataObjectScope metadataObjectNamePlural={objectNamePlural}>
              <ObjectTable objectNamePlural={objectNamePlural} />
            </MetadataObjectScope>
          </StyledTableContainer>
          <RecordTableActionBar />
          <RecordTableContextMenu />
        </RecoilScope>
      </PageBody>
    </PageContainer>
  );
};
