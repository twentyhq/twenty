import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useState } from 'react';

export const useFetchPeople = () => {
  const [peopleIds, fetchPeople] = useState<string[]>([]);
  const {
    records: fetchedPeople,
    loading,
    error,
  } = useFindManyRecords({
    objectNameSingular: 'person',
    filter: {
      id: {
        in: peopleIds,
      },
    },
    skip: !peopleIds.length,
  });
  return {
    people: fetchedPeople,
    loading,
    error,
    fetchPeople,
  };
};
