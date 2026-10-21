import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { type ReactElement, type ReactNode } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

const LINK_ACTIVITIES_DROPDOWN_WIDTH_PX = 320;

type LinkActivitiesDropdownProps = {
  dropdownId: string;
  ariaLabel: string;
  trigger: ReactElement;
  children: ReactNode;
};

export const LinkActivitiesDropdown = ({
  dropdownId,
  ariaLabel,
  trigger,
  children,
}: LinkActivitiesDropdownProps) => (
  <DropdownRoot dropdownId={dropdownId} type="picker" multiple>
    <Dropdown.Trigger render={trigger} />
    <DropdownContent
      width={LINK_ACTIVITIES_DROPDOWN_WIDTH_PX}
      align="end"
      aria-label={ariaLabel}
    >
      {children}
    </DropdownContent>
  </DropdownRoot>
);
