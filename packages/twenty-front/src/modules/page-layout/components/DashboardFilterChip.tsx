import { FORM_DATE_FIELD_PICKER_CLICK_OUTSIDE_ID } from '@/object-record/record-field/ui/form-types/constants/FormDateFieldPickerClickOutsideId';
import { PageLayoutFilterValueInput } from '@/page-layout/components/PageLayoutFilterValueInput';
import { useGetPageLayoutFilterValueLabel } from '@/page-layout/hooks/useGetPageLayoutFilterValueLabel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { isDefined } from 'twenty-shared/utils';
import {
  Dropdown,
  type DropdownDismissEvent,
} from 'twenty-ui/components/navigation';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

type DashboardFilterChipProps = {
  pageLayoutFilterId: string;
  label: string;
  value: PageLayoutFilterValue | null;
  inputLabel?: string;
  onChange: (value: PageLayoutFilterValue | null) => void;
};

export const DashboardFilterChip = ({
  pageLayoutFilterId,
  label,
  value,
  inputLabel,
  onChange,
}: DashboardFilterChipProps) => {
  const { getValueLabel } = useGetPageLayoutFilterValueLabel();
  const valueLabel = getValueLabel(value);

  // The date picker opens in its own portal, outside the dropdown content
  const handleInteractOutside = (event: DropdownDismissEvent) => {
    if (
      isDefined(
        event.target?.closest(
          `[data-click-outside-id="${FORM_DATE_FIELD_PICKER_CLICK_OUTSIDE_ID}"]`,
        ),
      )
    ) {
      event.preventDefault();
    }
  };

  return (
    <DropdownRoot
      dropdownId={`dashboard-filter-${pageLayoutFilterId}`}
      type="panel"
      onInteractOutside={handleInteractOutside}
    >
      <Dropdown.Trigger
        render={<span />}
        nativeButton={false}
        aria-label={`${label}: ${valueLabel}`}
      >
        <SortOrFilterChip
          type="filter"
          Icon={IconCalendarEvent}
          labelKey={label}
          labelValue={`: ${valueLabel}`}
        />
      </Dropdown.Trigger>
      <DropdownContent
        align="end"
        width={GenericDropdownContentWidth.ExtraLarge}
        aria-label={label}
      >
        <Dropdown.Section>
          <PageLayoutFilterValueInput
            label={inputLabel}
            emptyValueLabel={getValueLabel(null)}
            value={value}
            onChange={onChange}
          />
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
