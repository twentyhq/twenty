import styled from '@emotion/styled';
import { IconBuildingSkyscraper } from 'twenty-ui';

import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SignInBackgroundMockContainer } from '@/sign-in-background-mock/components/SignInBackgroundMockContainer';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';

const StyledTableContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const SignInBackgroundMockPage = () => {
  return (
    <PageContainer>
      <PageHeader title="Companies" Icon={IconBuildingSkyscraper}>
        <PageHotkeysEffect onAddButtonClick={() => {}} />
        <PageAddButton onClick={() => {}} />
      </PageHeader>
      <PageBody>
        <RecordFieldValueSelectorContextProvider>
          <StyledTableContainer>
            <SignInBackgroundMockContainer />
          </StyledTableContainer>
        </RecordFieldValueSelectorContextProvider>
      </PageBody>
    </PageContainer>
  );
};
