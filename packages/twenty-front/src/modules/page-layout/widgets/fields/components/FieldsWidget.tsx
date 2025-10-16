import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type FieldsWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldsWidget = ({ widget: _widget }: FieldsWidgetProps) => {
  const targetRecord = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <RecordFieldList
          instanceId={`fields-widget-${targetRecord.id}-${isInRightDrawer ? 'right-drawer' : ''}`}
          objectNameSingular={targetRecord.targetObjectNameSingular}
          objectRecordId={targetRecord.id}
          // TODO: pick the value from the widget configuration
          showDuplicatesSection={true}
        />
      </StyledContainer>
    </RightDrawerProvider>
  );
};
