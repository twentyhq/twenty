import { FilterDropdownCompanySearchSelect } from '@/companies/components/FilterDropdownCompanySearchSelect';
import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
} from '@/ui/icon/index';
import { icon } from '@/ui/themes/icon';
import { PipelineProgress } from '~/generated/graphql';

export const opportunitiesFilters: FilterDefinitionByEntity<PipelineProgress>[] =
  [
    {
      field: 'amount',
      label: 'Amount',
      icon: <IconCurrencyDollar size={icon.size.md} stroke={icon.stroke.sm} />,
      type: 'number',
    },
    {
      field: 'closeDate',
      label: 'Close date',
      icon: <IconCalendarEvent size={icon.size.md} stroke={icon.stroke.sm} />,
      type: 'date',
    },
    {
      field: 'progressableId',
      label: 'Company',
      icon: (
        <IconBuildingSkyscraper size={icon.size.md} stroke={icon.stroke.sm} />
      ),
      type: 'entity',
      entitySelectComponent: (
        <FilterDropdownCompanySearchSelect context={CompanyBoardContext} />
      ),
    },
  ];
