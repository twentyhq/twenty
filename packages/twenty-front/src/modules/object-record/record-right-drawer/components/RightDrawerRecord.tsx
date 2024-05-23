import { useRecoilValue } from 'recoil';

import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';

export const RightDrawerRecord = () => {
  const viewableRecordNameSingular = useRecoilValue(
    viewableRecordNameSingularState,
  );
  const viewableRecordId = useRecoilValue(viewableRecordIdState);

  if (!viewableRecordNameSingular) {
    throw new Error(`Object name is not defined`);
  }

  if (!viewableRecordId) {
    throw new Error(`Record id is not defined`);
  }

  return (
    <RecordShowContainer
      objectNameSingular={viewableRecordNameSingular}
      objectRecordId={viewableRecordId}
      loading={false}
      isInRightDrawer={true}
    />
  );
};
