import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { ObjectTable } from '@/metadata/components/ObjectTable';
import { DataTableActionBar } from '@/ui/data-table/action-bar/components/DataTableActionBar';
import { DataTableContextMenu } from '@/ui/data-table/context-menu/components/DataTableContextMenu';
import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { PageAddButton } from '@/ui/layout/components/PageAddButton';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/components/PageHotkeysEffect';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const ObjectTablePage = ({
  objectName,
  objectNameSingular,
}: {
  objectNameSingular: string;
  objectName: string;
}) => {
  const handleAddButtonClick = async () => {
    const newCompanyId: string = v4();

    // eslint-disable-next-line no-console
    console.log('newCompanyId', newCompanyId);
  };

  return (
    <PageContainer>
      <PageHeader title="Objects" Icon={IconBuildingSkyscraper}>
        <PageHotkeysEffect onAddButtonClick={handleAddButtonClick} />
        <PageAddButton onClick={handleAddButtonClick} />
      </PageHeader>
      <PageBody>
        <RecoilScope
          scopeId="objects"
          CustomRecoilScopeContext={TableRecoilScopeContext}
        >
          <StyledTableContainer>
            <ObjectTable
              objectName={objectName}
              objectNameSingular={objectNameSingular}
            />
          </StyledTableContainer>
          <DataTableActionBar />
          <DataTableContextMenu />
        </RecoilScope>
      </PageBody>
    </PageContainer>
  );
};
