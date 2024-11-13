import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { isDefined } from '~/utils/isDefined';

const StyledCompanyPickerContainer = styled.div`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

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
  const { setRelationPickerSearchFilter } = useRelationPicker({
    relationPickerScopeId: 'relation-picker',
  });
  const { handleCreateSuccess, handleEntitySelect } = useAddNewCard();

  const { objectMetadataItem: companyMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Company,
  });

  const relationFieldMetadataItem = companyMetadataItem.fields.find(
    (field) => field.name === 'opportunities',
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Company,
  });
  const { openRightDrawer } = useRightDrawer();

  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const handleCreateAndSelect = async (searchInput?: string) => {
    const newRecordId = v4();

    const createdCompany = await createOneRecord({
      id: newRecordId,
      name: searchInput,
    });

    setViewableRecordId(newRecordId);
    setViewableRecordNameSingular(CoreObjectNameSingular.Company);
    openRightDrawer(RightDrawerPages.ViewRecord);

    setRelationPickerSearchFilter(searchInput || '');

    if (isDefined(createdCompany)) {
      handleEntitySelect(
        position,
        {
          id: createdCompany.id,
          name: createdCompany.name,
          record: createdCompany,
        },
        columnId,
      );
    }
  };

  return (
    <>
      {newRecord.isCreating && newRecord.position === position && (
        <StyledCompanyPickerContainer>
          <RelationPickerScope relationPickerScopeId="relation-picker">
            <SingleEntitySelect
              onCancel={() => handleCreateSuccess(position, columnId, false)}
              onEntitySelected={(company) =>
                company ? handleEntitySelect(position, company, columnId) : null
              }
              relationObjectNameSingular={CoreObjectNameSingular.Company}
              relationPickerScopeId="relation-picker"
              selectedRelationRecordIds={[]}
              onCreate={handleCreateAndSelect}
            />
          </RelationPickerScope>
        </StyledCompanyPickerContainer>
      )}
    </>
  );
};
