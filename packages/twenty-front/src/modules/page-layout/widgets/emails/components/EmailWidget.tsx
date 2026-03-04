import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type EmailWidgetProps = {
  widget: PageLayoutWidget;
};

export const EmailWidget = ({ widget: _widget }: EmailWidgetProps) => {
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <SidePanelProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <EmailsCard />
      </StyledContainer>
    </SidePanelProvider>
  );
};
