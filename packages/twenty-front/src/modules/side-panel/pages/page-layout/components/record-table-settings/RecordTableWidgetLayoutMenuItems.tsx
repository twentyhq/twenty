import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { type RecordTableWidgetLayoutPickerOption } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type RecordTableWidgetLayoutMenuItemsProps = {
  layoutOptions: RecordTableWidgetLayoutPickerOption[];
  onSelect: (viewType: RecordTableWidgetLayoutViewType) => void;
};

export const RecordTableWidgetLayoutMenuItems = ({
  layoutOptions,
  onSelect,
}: RecordTableWidgetLayoutMenuItemsProps) => {
  const { t } = useLingui();

  return (
    <>
      {layoutOptions.map(
        ({ viewType, Icon, label, isDisabled, unavailableReason }) => (
          <Dropdown.OptionItem
            key={viewType}
            value={viewType}
            disabled={isDisabled}
            onSelect={() => onSelect(viewType)}
            description={
              isDefined(unavailableReason) ? t(unavailableReason) : undefined
            }
            descriptionPlacement="end"
            startIcon={<SelectOptionIcon Icon={Icon} />}
          >
            {t(label)}
          </Dropdown.OptionItem>
        ),
      )}
    </>
  );
};
