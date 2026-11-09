import { DATE_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/object-record/object-filter-dropdown/constants/DatePickerDropdownContentWidth';
import { PageLayoutFilterValueInput } from '@/page-layout/components/PageLayoutFilterValueInput';
import { useGetPageLayoutFilterValueLabel } from '@/page-layout/hooks/useGetPageLayoutFilterValueLabel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCalendarEvent, IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

const StyledChipTrigger = styled.span`
  border-radius: ${themeCssVariables.border.radius.smRound};
  display: flex;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 1px;
  }
`;

// One block, so a capped dropdown scrolls it instead of squeezing its rows
const StyledDropdownBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

type DashboardFilterChipProps = {
  pageLayoutFilterId: string;
  label: string;
  value: PageLayoutFilterValue | null;
  title?: string;
  onChange: (value: PageLayoutFilterValue | null) => void;
  children?: ReactNode;
};

export const DashboardFilterChip = ({
  pageLayoutFilterId,
  label,
  value,
  title = label,
  onChange,
  children,
}: DashboardFilterChipProps) => {
  const { t } = useLingui();
  const { getValueLabel } = useGetPageLayoutFilterValueLabel();
  const valueLabel = getValueLabel(value);
  const hasValue = isNonEmptyArray(value?.conditions);
  const dropdownId = `dashboard-filter-${pageLayoutFilterId}`;
  const { closeDropdown } = useCloseDropdown();

  return (
    <DropdownRoot dropdownId={dropdownId} type="panel">
      {hasValue ? (
        <Dropdown.Trigger
          render={<StyledChipTrigger />}
          nativeButton={false}
          aria-label={t`${label}: ${valueLabel}`}
        >
          <SortOrFilterChip
            type="filter"
            Icon={IconCalendarEvent}
            labelKey={label}
            labelValue={`: ${valueLabel}`}
          />
        </Dropdown.Trigger>
      ) : (
        <Dropdown.Trigger
          render={<LightButton startIcon={<IconCalendarEvent />} />}
        >
          {label}
        </Dropdown.Trigger>
      )}
      <DropdownContent
        align="end"
        sideOffset={8}
        collisionAvoidance={{ fallbackAxisSide: 'none' }}
        width={DATE_PICKER_DROPDOWN_CONTENT_WIDTH}
        aria-label={label}
      >
        <StyledDropdownBody>
          <DropdownMenuHeader
            StartComponent={
              <DropdownMenuHeaderLeftComponent
                onClick={() => closeDropdown(dropdownId)}
                Icon={IconX}
              />
            }
          >
            {title}
          </DropdownMenuHeader>
          <PageLayoutFilterValueInput
            label={label}
            emptyValueLabel={getValueLabel(null)}
            value={value}
            onChange={onChange}
          />
          {children}
        </StyledDropdownBody>
      </DropdownContent>
    </DropdownRoot>
  );
};
