import { useState } from 'react';
import DropdownButton from './DropdownButton';
import { FilterType } from './SortAndFilterBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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

export function FilterDropdownButton() {
  const [isUnfolded, setIsUnfolded] = useState(false);

  return (
    <DropdownButton
      label="Filter"
      isActive={false}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
    >
      {filters.map((filter, index) => (
        <DropdownButton.StyledDropdownItem key={index + 1}>
          <DropdownButton.StyledIcon>
            {filter.icon && <FontAwesomeIcon icon={filter.icon} />}
          </DropdownButton.StyledIcon>
          {filter.label}
        </DropdownButton.StyledDropdownItem>
      ))}
    </DropdownButton>
  );
}
