import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

type useRecordIndexPageKanbanAddButtonProps = {
  objectNamePlural: string;
};

export const useRecordIndexPageKanbanAddButton = ({
  objectNamePlural,
}: useRecordIndexPageKanbanAddButtonProps) => {
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );
  const { createOneRecord } = useCreateOneRecord({ objectNameSingular });

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  );
  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity;

  const createOpportunity = (
    company: EntityForSelect,
    columnDefinition: RecordBoardColumnDefinition,
  ) => {
    if (isDefined(selectFieldMetadataItem)) {
      createOneRecord({
        name: company.name,
        companyId: company.id,
        position: 'first',
        [selectFieldMetadataItem.name]: columnDefinition?.value,
      });
    }
  };

  return {
    selectFieldMetadataItem,
    isOpportunity,
    createOpportunity,
  };
};
