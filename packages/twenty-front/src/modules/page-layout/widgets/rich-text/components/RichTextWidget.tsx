import { FieldRichTextCard } from '@/ui/layout/show-page/components/FieldRichTextCard';
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
      <FieldRichTextCard />
    </StyledContainer>
  );
};
