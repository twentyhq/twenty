import { RichTextCard } from '@/ui/layout/show-page/components/RichTextCard';
import styled from '@emotion/styled';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type RichTextWidgetProps = {
  widget: PageLayoutWidget;
};

export const RichTextWidget = ({ widget: _widget }: RichTextWidgetProps) => {
  return (
    <StyledContainer>
      <RichTextCard />
    </StyledContainer>
  );
};
