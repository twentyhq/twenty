import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldRichTextCard } from '@/page-layout/widgets/field-rich-text/components/FieldRichTextCard';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  box-sizing: border-box;
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
