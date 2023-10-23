import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { ObjectTable } from '@/metadata/components/ObjectTable';
import { MetadataObjectIdentifier } from '@/metadata/types/MetadataObjectIdentifier';
import { DataTableActionBar } from '@/ui/data/data-table/action-bar/components/DataTableActionBar';
import { DataTableContextMenu } from '@/ui/data/data-table/context-menu/components/DataTableContextMenu';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { useCreateOneObject } from '../hooks/useCreateOneObject';
import { useFindOneMetadataObject } from '../hooks/useFindOneMetadataObject';
import { MetadataObjectScope } from '../scopes/MetadataObjectScope';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export type ObjectTablePageProps = MetadataObjectIdentifier;

export const ObjectTablePage = () => {
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
    createOneObject?.({
      name: 'Test',
    });
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
          <DataTableActionBar />
          <DataTableContextMenu />
        </RecoilScope>
      </PageBody>
    </PageContainer>
  );
};
