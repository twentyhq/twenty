import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { type FieldCardConfiguration } from '@/object-record/record-show/types/CardConfiguration';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { type PageLayoutWidget } from '~/generated/graphql';

type FieldsWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldsWidget = ({ widget }: FieldsWidgetProps) => {
  const targetRecord = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  // Parse configuration from widget
  const configuration = widget.configuration as FieldCardConfiguration | null;

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <RecordFieldList
          instanceId={`fields-widget-${targetRecord.id}-${isInRightDrawer ? 'right-drawer' : ''}`}
          objectNameSingular={targetRecord.targetObjectNameSingular}
          objectRecordId={targetRecord.id}
          showDuplicatesSection={configuration?.showDuplicatesSection ?? true}
        />
      </div>
    </RightDrawerProvider>
  );
};
