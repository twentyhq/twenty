export type BackgroundMockColumn = {
  label: string;
  iconName: string;
  width: number;
};

export const BACKGROUND_MOCK_COLUMNS = [
  { label: 'Name', iconName: 'IconBuildingSkyscraper', width: 180 },
  { label: 'Domain', iconName: 'IconLink', width: 150 },
  { label: 'Employees', iconName: 'IconUsers', width: 100 },
  { label: 'People', iconName: 'IconUsers', width: 200 },
  { label: 'Address', iconName: 'IconMap', width: 170 },
  { label: 'Account Owner', iconName: 'IconUserCircle', width: 150 },
  { label: 'Creation date', iconName: 'IconCalendar', width: 150 },
  { label: 'ICP', iconName: 'IconTarget', width: 80 },
  { label: 'Linkedin', iconName: 'IconBrandLinkedin', width: 150 },
  { label: 'Opportunities', iconName: 'IconTargetArrow', width: 150 },
  { label: 'X', iconName: 'IconBrandX', width: 100 },
] satisfies BackgroundMockColumn[];
