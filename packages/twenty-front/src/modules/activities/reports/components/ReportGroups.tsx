import React from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

// TODO: Implement based on TaskGroups.tsx
export const ReportGroups = () => {
  const { records } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Report,
  });

  return <div>{JSON.stringify(records)}</div>;
};
