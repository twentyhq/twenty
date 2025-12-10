import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldRichTextCard } from '@/ui/layout/show-page/components/FieldRichTextCard';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FieldRichTextWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldRichTextWidget = ({
  widget: _widget,
}: FieldRichTextWidgetProps) => {
  return (
    <StyledContainer>
      <FieldRichTextCard />
    </StyledContainer>
  );
};
