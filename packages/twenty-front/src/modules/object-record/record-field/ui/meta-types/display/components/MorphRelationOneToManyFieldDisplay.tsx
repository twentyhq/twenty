import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMorphRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationFromManyFieldDisplay';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationOneToManyFieldDisplay = () => {
  const { fieldValues } = useMorphRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  if (!fieldValues) {
    return null;
  }

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {fieldValues.filter(isDefined).map((record) => {
        const recordChipData = record.generateRecordChipData(record.value);
        return (
          <RecordChip
            key={recordChipData.recordId}
            objectNameSingular={recordChipData.objectNameSingular}
            record={record.value}
            forceDisableClick={disableChipClick}
            triggerEvent={triggerEvent}
          />
        );
      })}
    </ExpandableList>
  );
};
