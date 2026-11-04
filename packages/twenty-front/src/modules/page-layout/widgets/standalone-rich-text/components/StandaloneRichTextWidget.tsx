import { useRef } from 'react';

import { getRichTextFieldSerializedContent } from '@/object-record/record-field/ui/utils/getRichTextFieldSerializedContent';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { StandaloneRichTextEditorContent } from '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextEditorContent';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { type StandaloneRichTextConfiguration } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

type StandaloneRichTextWidgetProps = {
  widget: PageLayoutWidget;
};

export const StandaloneRichTextWidget = ({
  widget,
}: StandaloneRichTextWidgetProps) => {
  const containerElementRef = useRef<HTMLDivElement>(null);
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const configuration = widget.configuration as
    | StandaloneRichTextConfiguration
    | undefined;

  const currentBody = getRichTextFieldSerializedContent(configuration?.body);

  const isThisWidgetBeingEdited = pageLayoutEditingWidgetId === widget.id;
  const isEditable = isPageLayoutInEditMode;

  return (
    <StyledContainer ref={containerElementRef}>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-rich-text-widget-${widget.id}`}
      >
        <StandaloneRichTextEditorContent
          key={isEditable ? 'editing' : 'readonly'}
          widget={widget}
          currentBody={currentBody}
          isEditable={isEditable}
          shouldFocus={isEditable && isThisWidgetBeingEdited}
          containerElement={containerElementRef.current}
        />
      </ScrollWrapper>
    </StyledContainer>
  );
};
