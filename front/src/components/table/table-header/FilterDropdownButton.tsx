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

export function FilterDropdownButton() {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [isOptionUnfolded, setIsOptionUnfolded] = useState(false);

  const [selectedFilterOperand, setSelectedFilterOperand] =
    useState<FilterOperandType>(filterOperands[0]);

  return (
    <DropdownButton
      label="Filter"
      isActive={false}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
    >
      {isOptionUnfolded
        ? filterOperands.map((option, index) => (
            <DropdownButton.StyledDropdownItem
              key={index}
              onClick={() => {
                setSelectedFilterOperand(option);
                setIsOptionUnfolded(false);
              }}
            >
              {option.label}
            </DropdownButton.StyledDropdownItem>
          ))
        : [
            <DropdownButton.StyledDropdownTopOption
              key={0}
              onClick={() => setIsOptionUnfolded(true)}
            >
              {selectedFilterOperand.label}

              <FontAwesomeIcon icon={faAngleDown} />
            </DropdownButton.StyledDropdownTopOption>,
            ...filters.map((filter, index) => (
              <DropdownButton.StyledDropdownItem key={index + 1}>
                <DropdownButton.StyledIcon>
                  {filter.icon && <FontAwesomeIcon icon={filter.icon} />}
                </DropdownButton.StyledIcon>
                {filter.label}
              </DropdownButton.StyledDropdownItem>
            )),
          ]}
    </DropdownButton>
  );
}
