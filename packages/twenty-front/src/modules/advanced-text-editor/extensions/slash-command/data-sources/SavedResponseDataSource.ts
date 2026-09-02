import { useCallback } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type SavedResponseRecord = ObjectRecord & {
  name: string;
  subject: string | null;
  body: string | null;
  category: string | null;
};

export type SavedResponse = {
  id: string;
  name: string;
  subject: string | null;
  body: string;
  category: string | null;
};

export type SavedResponseDataSource = {
  getSavedResponses: () => readonly SavedResponse[];
  loading: boolean;
};

export const useSavedResponseDataSource = (): SavedResponseDataSource => {
  const { records, loading } = useFindManyRecords<SavedResponseRecord>({
    objectNameSingular: 'savedResponse',
    recordGqlFields: {
      id: true,
      name: true,
      subject: true,
      body: true,
      category: true,
    },
  });

  const getSavedResponses = useCallback(
    () =>
      records.map(({ id, name, subject, body, category }) => ({
        id,
        name,
        subject,
        body: body ?? '',
        category,
      })),
    [records],
  );

  return { getSavedResponses, loading };
};
