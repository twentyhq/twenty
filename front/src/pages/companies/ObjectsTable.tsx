import styled from '@emotion/styled';

import { ObjectTable } from '@/metadata/components/ObjectTable';
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

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const ObjectTablePage = ({
  objectNamePlural,
  objectNameSingular,
}: {
  objectNameSingular: string;
  objectNamePlural: string;
}) => {
  const handleAddButtonClick = async () => {};

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
              objectNamePlural={objectNamePlural}
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
