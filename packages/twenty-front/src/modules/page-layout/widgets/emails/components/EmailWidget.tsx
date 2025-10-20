import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledContainer = styled.div`
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
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <EmailsCard />
      </StyledContainer>
    </RightDrawerProvider>
  );
};
