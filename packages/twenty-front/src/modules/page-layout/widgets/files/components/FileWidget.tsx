import { FilesCard } from '@/activities/files/components/FilesCard';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { Suspense } from 'react';

type FileWidgetProps = {
  widget: PageLayoutWidget;
};

export const FileWidget = ({ widget: _widget }: FileWidgetProps) => (
  <WidgetContentShell>
    <Suspense fallback={<SkeletonLoader />}>
      <FilesCard />
    </Suspense>
  </WidgetContentShell>
);
