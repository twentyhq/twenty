import { TableColumn } from '@/people/table/components/peopleColumns';
import {
  IconBrandLinkedin,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/icon/index';

import { EditableCompanyAccountOwnerCell } from './EditableCompanyAccountOwnerCell';
import { EditableCompanyAddressCell } from './EditableCompanyAddressCell';
import { EditableCompanyCreatedAtCell } from './EditableCompanyCreatedAtCell';
import { EditableCompanyDomainNameCell } from './EditableCompanyDomainNameCell';
import { EditableCompanyEmployeesCell } from './EditableCompanyEmployeesCell';
import { EditableCompanyLinkedinUrlCell } from './EditableCompanyLinkedinUrlCell';
import { EditableCompanyNameCell } from './EditableCompanyNameCell';

export const companyColumns: TableColumn[] = [
  {
    id: 'name',
    title: 'Name',
    icon: <IconBuildingSkyscraper size={16} />,
    size: 180,
    cellComponent: <EditableCompanyNameCell />,
  },
  {
    id: 'domainName',
    title: 'URL',
    icon: <IconLink size={16} />,
    size: 100,
    cellComponent: <EditableCompanyDomainNameCell />,
  },
  {
    id: 'accountOwner',
    title: 'Account owner',
    icon: <IconUser size={16} />,
    size: 150,
    cellComponent: <EditableCompanyAccountOwnerCell />,
  },
  {
    id: 'createdAt',
    title: 'Creation',
    icon: <IconCalendarEvent size={16} />,
    size: 150,
    cellComponent: <EditableCompanyCreatedAtCell />,
  },
  {
    id: 'employees',
    title: 'Employees',
    icon: <IconUsers size={16} />,
    size: 150,
    cellComponent: <EditableCompanyEmployeesCell />,
  },
  {
    id: 'address',
    title: 'Address',
    icon: <IconMap size={16} />,
    size: 170,
    cellComponent: <EditableCompanyAddressCell />,
  },
  {
    id: 'linkedinUrl',
    title: 'Linkedin',
    icon: <IconBrandLinkedin size={16} />,
    size: 170,
    cellComponent: <EditableCompanyLinkedinUrlCell />,
  },
];
