import { FilesCard } from '@/activities/files/components/FilesCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type FileWidgetProps = {
  widget: PageLayoutWidget;
};

export const FileWidget = ({ widget: _widget }: FileWidgetProps) => (
  <WidgetContentShell>
    <FilesCard />
  </WidgetContentShell>
);
