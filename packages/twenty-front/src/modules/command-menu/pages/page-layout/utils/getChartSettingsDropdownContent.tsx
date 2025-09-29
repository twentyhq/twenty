import { ChartDataSourceDropdownContent } from '@/command-menu/pages/page-layout/components/ChartDataSourceDropdownContent';
import { ChartXAxisFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartXAxisFieldSelectionDropdownContent';

export const getChartSettingsDropdownContent = (itemId: string) => {
  switch (itemId) {
    case 'source':
      return <ChartDataSourceDropdownContent />;
    case 'data-on-display-x':
      return <ChartXAxisFieldSelectionDropdownContent />;
    default:
      return <div>Configuration options will be implemented here</div>;
  }
};
