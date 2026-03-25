import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutSetup } from '@/page-layout/components/PageLayoutSetup';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

type PageLayoutRendererProps = {
  pageLayoutId: string;
};

export const PageLayoutRenderer = ({
  pageLayoutId,
}: PageLayoutRendererProps) => {
  return (
    <PageLayoutSetup pageLayoutId={pageLayoutId}>
      <PageLayoutRendererContent />
    </PageLayoutSetup>
  );
};
