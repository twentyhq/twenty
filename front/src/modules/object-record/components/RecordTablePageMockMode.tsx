import styled from '@emotion/styled';

import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { RecordTableContainerMockMode } from '@/object-record/components/RecordTableContainerMockMode';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { RecordTableActionBar } from '@/ui/object/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableContextMenu } from '@/ui/object/record-table/context-menu/components/RecordTableContextMenu';

const StyledTableContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export type RecordTablePageProps = Pick<
  ObjectMetadataItemIdentifier,
  'objectNamePlural'
>;

export const RecordTablePageMockMode = () => {
  const objectNamePlural = 'companies';

  return (
    <PageContainer>
      <PageHeader title="Objects" Icon={IconBuildingSkyscraper}>
        <PageHotkeysEffect onAddButtonClick={() => {}} />
        <PageAddButton onClick={() => {}} />
      </PageHeader>
      <PageBody>
        <StyledTableContainer>
          <RecordTableContainerMockMode objectNamePlural={objectNamePlural} />
        </StyledTableContainer>
        <RecordTableActionBar />
        <RecordTableContextMenu />
      </PageBody>
    </PageContainer>
  );
};
