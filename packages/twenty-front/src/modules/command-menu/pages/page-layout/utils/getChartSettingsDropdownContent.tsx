import { ChartColorSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartColorSelectionDropdownContent';
import { ChartDataSourceDropdownContent } from '@/command-menu/pages/page-layout/components/ChartDataSourceDropdownContent';
import { ChartXAxisFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartXAxisFieldSelectionDropdownContent';
import { ChartYAxisFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartYAxisFieldSelectionDropdownContent';

export const getChartSettingsDropdownContent = (itemId: string) => {
  switch (itemId) {
    case 'source':
      return <ChartDataSourceDropdownContent />;
    case 'data-on-display-x':
      return <ChartXAxisFieldSelectionDropdownContent />;
    case 'data-on-display-y':
      return <ChartYAxisFieldSelectionDropdownContent />;
    case 'colors':
      return <ChartColorSelectionDropdownContent />;
    default:
      return <div>Configuration options will be implemented here</div>;
  }
};
