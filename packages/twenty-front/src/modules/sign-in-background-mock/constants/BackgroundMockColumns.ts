import { BACKGROUND_MOCK_COLUMN_WIDTHS } from '@/sign-in-background-mock/constants/BackgroundMockColumnWidths';

export type BackgroundMockColumn = {
  label: keyof typeof BACKGROUND_MOCK_COLUMN_WIDTHS;
  iconName: string;
  width: number;
};

export const BACKGROUND_MOCK_COLUMNS = [
  {
    label: 'Name',
    iconName: 'IconBuildingSkyscraper',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Name,
  },
  {
    label: 'Domain',
    iconName: 'IconLink',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Domain,
  },
  {
    label: 'Created by',
    iconName: 'IconUserCircle',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS['Created by'],
  },
  {
    label: 'Account Owner',
    iconName: 'IconUserCircle',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS['Account Owner'],
  },
  {
    label: 'Creation date',
    iconName: 'IconCalendar',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS['Creation date'],
  },
  {
    label: 'Employees',
    iconName: 'IconUsers',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Employees,
  },
  {
    label: 'Address',
    iconName: 'IconMap',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Address,
  },
] satisfies BackgroundMockColumn[];
