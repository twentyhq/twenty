import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { isActorSourceCompositeFilter } from '../utils/isActorSourceCompositeFilter';
import { ObjectFilterDropdownDateInput } from './ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownNumberInput } from './ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOptionSelect } from './ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from './ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from './ObjectFilterDropdownSearchInput';
import { ObjectFilterDropdownSourceSelect } from './ObjectFilterDropdownSourceSelect';
import { ObjectFilterDropdownTextSearchInput } from './ObjectFilterDropdownTextSearchInput';

type ConfigurableFilterDropdownContentProps = {
  filterDefinitionUsedInDropdown: FilterDefinition;
};

export const ConfigurableFilterDropdownContent = ({
  filterDefinitionUsedInDropdown,
}: ConfigurableFilterDropdownContentProps) => {
  return (
    <>
      {[
        'TEXT',
        'EMAIL',
        'EMAILS',
        'PHONE',
        'FULL_NAME',
        'LINK',
        'LINKS',
        'ADDRESS',
        'ACTOR',
        'ARRAY',
        'PHONES',
      ].includes(filterDefinitionUsedInDropdown.type) &&
        !isActorSourceCompositeFilter(filterDefinitionUsedInDropdown) && (
          <ObjectFilterDropdownTextSearchInput />
        )}
      {['NUMBER', 'CURRENCY'].includes(filterDefinitionUsedInDropdown.type) && (
        <ObjectFilterDropdownNumberInput />
      )}
      {filterDefinitionUsedInDropdown.type === 'RATING' && (
        <ObjectFilterDropdownRatingInput />
      )}
      {['DATE_TIME', 'DATE'].includes(filterDefinitionUsedInDropdown.type) && (
        <ObjectFilterDropdownDateInput />
      )}
      {filterDefinitionUsedInDropdown.type === 'RELATION' && (
        <>
          <ObjectFilterDropdownSearchInput />
          <ObjectFilterDropdownRecordSelect />
        </>
      )}
      {isActorSourceCompositeFilter(filterDefinitionUsedInDropdown) && (
        <>
          <DropdownMenuSeparator />
          <ObjectFilterDropdownSourceSelect />
        </>
      )}
      {filterDefinitionUsedInDropdown.type === 'SELECT' && (
        <>
          <ObjectFilterDropdownSearchInput />
          <ObjectFilterDropdownOptionSelect />
        </>
      )}
    </>
  );
};
