import { useLingui } from '@lingui/react/macro';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { MAX_RELATION_CHIPS_DISPLAYED_INLINE } from '@/object-record/record-field/ui/meta-types/display/constants/MaxRelationChipsDisplayedInline';
import { useMorphRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationFromManyFieldDisplay';

import { OverflowingList } from 'twenty-ui/components';
import { useContext } from 'react';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationOneToManyFieldDisplay = () => {
  const { t } = useLingui();

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
    <OverflowingList
      overflowLabel={t`Show all items`}
      showOverflowCount={isFocused}
      maxInlineCount={MAX_RELATION_CHIPS_DISPLAYED_INLINE}
    >
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
    </OverflowingList>
  );
};
