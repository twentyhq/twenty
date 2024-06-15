import { EntityChip } from 'twenty-ui';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRelationFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFieldDisplay';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const RelationFromManyFieldDisplay = ({
  fieldValue,
}: {
  fieldValue: ObjectRecord[];
}) => {
  const { isFocused } = useFieldFocus();
  const { generateRecordChipData } = useRelationFieldDisplay();

  const recordChipsData = fieldValue.map((fieldValueItem) =>
    generateRecordChipData(fieldValueItem),
  );

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {recordChipsData.map((record) => {
        return (
          <EntityChip
            key={record.recordId}
            entityId={record.recordId}
            name={record.name as any}
            avatarType={record.avatarType}
            avatarUrl={getImageAbsoluteURIOrBase64(record.avatarUrl) || ''}
            linkToEntity={record.linkToShowPage}
          />
        );
      })}
    </ExpandableList>
  );
};
