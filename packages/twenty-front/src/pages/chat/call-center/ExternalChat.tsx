import { PaneChat } from '@/chat/call-center/components/PaneChat';
import { PaneSide } from '@/chat/call-center/components/PaneSide';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports
import { IconBrandWechat } from '@tabler/icons-react';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export const CallCenter = () => {
  return (
    <PageContainer>
      <PageHeader Icon={IconBrandWechat} title="Chat" />
      <PageBody>
        <StyledMainContainer>
          <PaneSide />
          <PaneChat />
        </StyledMainContainer>
      </PageBody>
    </PageContainer>
  );
};
