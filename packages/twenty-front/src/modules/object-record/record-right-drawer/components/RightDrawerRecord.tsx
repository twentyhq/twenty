import { useRecoilValue } from 'recoil';

import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

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

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    viewableRecordNameSingular ?? '',
    viewableRecordId ?? '',
  );

  return (
    <RecordFieldValueSelectorContextProvider>
      <RecordValueSetterEffect recordId={objectRecordId} />
      <RecordShowContainer
        objectNameSingular={objectNameSingular}
        objectRecordId={objectRecordId}
        loading={false}
        isInRightDrawer={true}
      />
    </RecordFieldValueSelectorContextProvider>
  );
};
