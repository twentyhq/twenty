import { BACKGROUND_MOCK_COLUMN_WIDTHS } from '@/sign-in-background-mock/constants/BackgroundMockColumnWidths';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type BackgroundMockColumn = {
  label: MessageDescriptor;
  iconName: string;
  width: number;
};

export const BACKGROUND_MOCK_COLUMNS = [
  {
    label: msg`Name`,
    iconName: 'IconBuildingSkyscraper',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Name,
  },
  {
    label: msg`Domain`,
    iconName: 'IconLink',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Domain,
  },
  {
    label: msg`Created by`,
    iconName: 'IconUserCircle',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS['Created by'],
  },
  {
    label: msg`Account Owner`,
    iconName: 'IconUserCircle',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS['Account Owner'],
  },
  {
    label: msg`Creation date`,
    iconName: 'IconCalendar',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS['Creation date'],
  },
  {
    label: msg`Employees`,
    iconName: 'IconUsers',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Employees,
  },
  {
    label: msg`Address`,
    iconName: 'IconMap',
    width: BACKGROUND_MOCK_COLUMN_WIDTHS.Address,
  },
] satisfies BackgroundMockColumn[];
