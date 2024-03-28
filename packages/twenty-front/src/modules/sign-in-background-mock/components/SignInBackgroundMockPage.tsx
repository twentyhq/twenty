import styled from '@emotion/styled';
import {
  IconBuildingSkyscraper,
  PageAddButton,
  PageContainer,
  PageHeader,
} from 'twenty-ui';

import { RightDrawerContainer } from '@/activities/right-drawer/components/RightDrawerContainer';
import { RightDrawerRouter } from '@/activities/right-drawer/components/RightDrawerRouter';
import { RecordTableActionBar } from '@/object-record/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableContextMenu } from '@/object-record/record-table/context-menu/components/RecordTableContextMenu';
import { SignInBackgroundMockContainer } from '@/sign-in-background-mock/components/SignInBackgroundMockContainer';
import { PageHotkeysEffect } from '~/pages/PageHotkeysEffect';

const StyledTableContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const SignInBackgroundMockPage = () => {
  return (
    <PageContainer>
      <PageHeader title="Objects" Icon={IconBuildingSkyscraper}>
        <PageHotkeysEffect onAddButtonClick={() => {}} />
        <PageAddButton onClick={() => {}} />
      </PageHeader>
      <RightDrawerContainer rightDrawerContent={<RightDrawerRouter />}>
        <StyledTableContainer>
          <SignInBackgroundMockContainer />
        </StyledTableContainer>
        <RecordTableActionBar recordTableId="mock" />
        <RecordTableContextMenu recordTableId="mock" />
      </RightDrawerContainer>
    </PageContainer>
  );
};
