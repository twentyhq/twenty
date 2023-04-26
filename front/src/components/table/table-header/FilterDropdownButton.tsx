import { useState } from 'react';
import DropdownButton from './DropdownButton';
import { FilterType } from './SortAndFilterBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faBuildings,
  faCalendar,
  faEnvelope,
  faMapPin,
  faPhone,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';

const filters: FilterType[] = [
  {
    id: 'fullname',
    label: 'People',
    icon: faUser,
  },
  {
    id: 'company_name',
    label: 'Company',
    icon: faBuildings,
  },
  {
    id: 'email',
    label: 'Email',
    icon: faEnvelope,
  },
  { id: 'phone', label: 'Phone', icon: faPhone },
  {
    id: 'created_at',
    label: 'Created at',
    icon: faCalendar,
  },
  { id: 'city', label: 'City', icon: faMapPin },
];

type FilterOperandType = { label: string; id: string };

const filterOperands: FilterOperandType[] = [
  { label: 'Include', id: 'include' },
  { label: "Doesn't include", id: 'not-include' },
];

const someFieldRandomValue = [
  'John Doe',
  'Jane Doe',
  'John Smith',
  'Jane Smith',
  'John Johnson',
  'Jane Johnson',
  'John Williams',
  'Jane Williams',
  'John Brown',
  'Jane Brown',
  'John Jones',
  'Jane Jones',
];

export function FilterDropdownButton() {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<FilterType | undefined>(
    undefined,
  );

  const [selectedFilterOperand, setSelectedFilterOperand] =
    useState<FilterOperandType>(filterOperands[0]);

  return (
    <DropdownButton
      label="Filter"
      isActive={false}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
    >
      {selectedFilter
        ? isOptionUnfolded
          ? filterOperands.map((filterOperand, index) => (
              <DropdownButton.StyledDropdownItem
                key={`select-filter-operand-${index}`}
                onClick={() => {
                  setSelectedFilterOperand(filterOperand);
                  setIsOptionUnfolded(false);
                }}
              >
                {filterOperand.label}
              </DropdownButton.StyledDropdownItem>
            ))
          : [
              <DropdownButton.StyledDropdownTopOption
                key={'selected-filter'}
                onClick={() => setSelectedFilter(undefined)}
              >
                {selectedFilter.label}
                <FontAwesomeIcon icon={faAngleDown} />
              </DropdownButton.StyledDropdownTopOption>,
              <DropdownButton.StyledDropdownTopOption
                key={'selected-filter-operand'}
                onClick={() => setIsOptionUnfolded(true)}
              >
                {selectedFilterOperand.label}

                <FontAwesomeIcon icon={faAngleDown} />
              </DropdownButton.StyledDropdownTopOption>,
              someFieldRandomValue.map((value, index) => (
                <DropdownButton.StyledDropdownItem
                  key={`fields-value-${index}`}
                  onClick={() => {
                    setIsUnfolded(false);
                    setSelectedFilter(undefined);
                  }}
                >
                  {value}
                </DropdownButton.StyledDropdownItem>
              )),
            ]
        : filters.map((filter, index) => (
            <DropdownButton.StyledDropdownItem
              key={`select-filter-${index}`}
              onClick={() => {
                setSelectedFilter(filter);
              }}
            >
              <DropdownButton.StyledIcon>
                {filter.icon && <FontAwesomeIcon icon={filter.icon} />}
              </DropdownButton.StyledIcon>
              {filter.label}
            </DropdownButton.StyledDropdownItem>
          ))}
    </DropdownButton>
  );
}
