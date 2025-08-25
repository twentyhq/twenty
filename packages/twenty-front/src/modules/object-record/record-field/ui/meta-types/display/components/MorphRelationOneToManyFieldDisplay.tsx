import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useMorphRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationFromManyFieldDisplay';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { Fragment, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationOneToManyFieldDisplay = () => {
  const { morphValuesWithObjectNameSingular } =
    useMorphRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  if (!morphValuesWithObjectNameSingular) {
    return null;
  }

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {morphValuesWithObjectNameSingular
        .filter(isDefined)
        .map((morphValueWithObjectNameSingular) => {
          return (
            <Fragment key={morphValueWithObjectNameSingular.objectNameSingular}>
              {morphValueWithObjectNameSingular.value.map((record) => {
                return (
                  <RecordChip
                    key={record.id}
                    objectNameSingular={
                      morphValueWithObjectNameSingular.objectNameSingular
                    }
                    record={record}
                    forceDisableClick={disableChipClick}
                    triggerEvent={triggerEvent}
                  />
                );
              })}
            </Fragment>
          );
        })}
    </ExpandableList>
  );
};
