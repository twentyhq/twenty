import { OVERFLOWING_LIST_EVENT_ISOLATION_PROPS } from '@/ui/layout/overflowing-list/constants/OverflowingListEventIsolationProps';
import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { OverflowingList } from 'twenty-ui/components/layout';
import { t } from '@lingui/core/macro';
import { Chip } from 'twenty-ui/primitives/data-display';

type ArrayDisplayProps = {
  value: FieldArrayValue;
};

export const ArrayDisplay = ({ value }: ArrayDisplayProps) => {
  return (
    <OverflowingList
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...OVERFLOWING_LIST_EVENT_ISOLATION_PROPS}
      overflowLabel={t`Show all items`}
    >
      {value?.map((item, index) => (
        <Chip key={`${item}-${index}`} variant="soft">
          {getChipLabel(item).content}
        </Chip>
      ))}
    </OverflowingList>
  );
};
