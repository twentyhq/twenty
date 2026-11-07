import { PAGE_LAYOUT_DROPDOWN_CONTENT_MAX_HEIGHT } from '@/side-panel/pages/page-layout/constants/PageLayoutDropdownContentMaxHeight';
import { type ReactNode } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

type ChartSettingsDropdownSectionProps = {
  children: ReactNode;
};

export const ChartSettingsDropdownSection = ({
  children,
}: ChartSettingsDropdownSectionProps) => (
  <Dropdown.Section
    scrollable
    style={{ maxHeight: PAGE_LAYOUT_DROPDOWN_CONTENT_MAX_HEIGHT }}
  >
    {children}
  </Dropdown.Section>
);
