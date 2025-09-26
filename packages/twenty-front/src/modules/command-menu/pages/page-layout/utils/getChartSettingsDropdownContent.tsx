import { ChartDataSourceDropdownContent } from '@/command-menu/pages/page-layout/components/ChartDataSourceDropdownContent';

export const getChartSettingsDropdownContent = (itemId: string) => {
  switch (itemId) {
    case 'source':
      return <ChartDataSourceDropdownContent />;
    default:
      return <div>configuration options will be implemented here</div>;
  }
};
