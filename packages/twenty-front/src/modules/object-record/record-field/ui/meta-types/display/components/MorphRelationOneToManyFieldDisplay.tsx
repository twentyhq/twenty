import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMorphRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationFromManyFieldDisplay';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useContext } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationOneToManyFieldDisplay = () => {
  const { morphValuesWithObjectNameSingular } =
    useMorphRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  if (!isDefined(morphValuesWithObjectNameSingular)) {
    return null;
  }

  const areMorphValuesWithObjectNameSingularEmpty =
    morphValuesWithObjectNameSingular.every(
      (morphValueWithObjectNameSingular) =>
        morphValueWithObjectNameSingular.value.length === 0,
    );

  if (areMorphValuesWithObjectNameSingularEmpty) {
    return null;
  }

  const flattenMorphValuesWithObjectNameSingular =
    morphValuesWithObjectNameSingular.flatMap(
      (morphValueWithObjectNameSingular) =>
        morphValueWithObjectNameSingular.value.map((record: ObjectRecord) => ({
          objectNameSingular:
            morphValueWithObjectNameSingular.objectNameSingular,
          record,
        })),
    );

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {flattenMorphValuesWithObjectNameSingular
        .filter(isDefined)
        .map(({ objectNameSingular, record }) => {
          return (
            <RecordChip
              key={record.id}
              objectNameSingular={objectNameSingular}
              record={record}
              forceDisableClick={disableChipClick}
              triggerEvent={triggerEvent}
            />
          );
        })}
    </ExpandableList>
  );
};
