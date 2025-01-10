import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { SingleRecordSelect } from '@/object-record/relation-picker/components/SingleRecordSelect';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { isDefined } from '~/utils/isDefined';

export const RecordBoardColumnNewOpportunity = ({
  columnId,
  position,
}: {
  columnId: string;
  position: 'last' | 'first';
}) => {
  const newRecord = useRecoilValue(
    recordBoardNewRecordByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );

  const { handleCreateSuccess, handleEntitySelect } = useAddNewCard();

  const { createOneRecord: createCompany } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Company,
  });
  const { openRightDrawer } = useRightDrawer();

  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const createCompanyOpportunityAndOpenRightDrawer = async (
    searchInput?: string,
  ) => {
    const newRecordId = v4();

    const createdCompany = await createCompany({
      id: newRecordId,
      name: searchInput,
    });

    setViewableRecordId(newRecordId);
    setViewableRecordNameSingular(CoreObjectNameSingular.Company);
    openRightDrawer(RightDrawerPages.ViewRecord);

    if (isDefined(createdCompany)) {
      handleEntitySelect(position, createdCompany);
    }
  };

  return (
    <>
      {newRecord.isCreating && newRecord.position === position && (
        <OverlayContainer>
          <RecordPickerComponentInstanceContext.Provider
            value={{ instanceId: RelationPickerHotkeyScope.RelationPicker }}
          >
            <SingleRecordSelect
              onCancel={() => handleCreateSuccess(position, columnId, false)}
              onRecordSelected={(company) =>
                company ? handleEntitySelect(position, company) : null
              }
              objectNameSingular={CoreObjectNameSingular.Company}
              selectedRecordIds={[]}
              onCreate={createCompanyOpportunityAndOpenRightDrawer}
            />
          </RecordPickerComponentInstanceContext.Provider>
        </OverlayContainer>
      )}
    </>
  );
};
