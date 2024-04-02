import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { Activity } from '@/activities/types/Activity';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordLoadingFamilyState } from '@/object-record/record-store/states/recordLoadingFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from '~/utils/isDefined';

export const RecordShowContainer = ({
  objectRecordId,
  objectNameSingular,
}: {
  objectRecordId: string;
  objectNameSingular: string;
}) => {
  const { record: activity, loading } = useFindOneRecord<Activity>({
    objectRecordId,
    objectNameSingular,
    depth: 3,
  });

  const setRecordStore = useSetRecoilState(
    recordStoreFamilyState(objectRecordId),
  );

  const [recordLoading, setRecordLoading] = useRecoilState(
    recordLoadingFamilyState(objectRecordId),
  );

  useEffect(() => {
    if (loading !== recordLoading) {
      setRecordLoading(loading);
    }
  }, [loading, recordLoading, setRecordLoading]);

  useEffect(() => {
    if (!loading && isDefined(activity)) {
      setRecordStore(activity);
    }
  }, [loading, setRecordStore, activity]);
};
