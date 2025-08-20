import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMorphRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationFromManyFieldDisplay';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationOneToManyFieldDisplay = () => {
  console.log('MorphRelationFromManyFieldDisplay');
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useMorphRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  console.log(fieldDefinition);
  console.log('fieldValue', fieldValue);

  if (!fieldValue) {
    return null;
  }

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {fieldValue.filter(isDefined).map((record) => {
        const recordChipData = generateRecordChipData(record);
        return (
          <RecordChip
            key={recordChipData.recordId}
            objectNameSingular={recordChipData.objectNameSingular}
            record={record}
            forceDisableClick={disableChipClick}
            triggerEvent={triggerEvent}
          />
        );
      })}
    </ExpandableList>
  );
};
