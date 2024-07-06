import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Report } from '@/activities/reports/types/Report';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';

export const PageAddReportButton = () => {
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const { createOneRecord: createOneReport } = useCreateOneRecord<Report>({
    objectNameSingular: CoreObjectNameSingular.Report,
  });

  return (
    <PageAddButton
      onClick={async () => {
        if (creating) return;
        setCreating(true);
        const report = await createOneReport({ title: 'New Report' });
        await navigate(`/reports/${report.id}/charts`);
        setCreating(false);
      }}
    />
  );
};
