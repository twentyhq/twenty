import {
  IconBrandLinkedin,
  IconBuildingSkyscraper,
  IconMail,
  IconMap,
  IconUsers,
} from '@/ui/icon';

export const fieldsForCompany = [
  {
    icon: <IconBuildingSkyscraper />,
    label: 'Name',
    key: 'name',
    alternateMatches: ['name', 'company name', 'company'],
    fieldType: {
      type: 'input',
    },
    example: 'Tim',
    validations: [
      {
        rule: 'required',
        errorMessage: 'Name is required',
        level: 'error',
      },
    ],
  },
  {
    icon: <IconMail />,
    label: 'Domain name',
    key: 'domainName',
    alternateMatches: ['domain', 'domain name'],
    fieldType: {
      type: 'input',
    },
    example: 'apple.dev',
    validations: [
      {
        rule: 'required',
        errorMessage: 'Domain name is required',
        level: 'error',
      },
    ],
  },
  {
    icon: <IconBrandLinkedin />,
    label: 'Linkedin URL',
    key: 'linkedinUrl',
    alternateMatches: ['linkedIn', 'linkedin', 'linkedin url'],
    fieldType: {
      type: 'input',
    },
    example: 'https://www.linkedin.com/in/apple',
  },
  {
    icon: <IconMap />,
    label: 'Address',
    key: 'address',
    fieldType: {
      type: 'input',
    },
    example: 'Maple street',
    validations: [
      {
        rule: 'required',
        errorMessage: 'Address is required',
        level: 'error',
      },
    ],
  },
  {
    icon: <IconUsers />,
    label: 'Employees',
    key: 'employees',
    alternateMatches: ['employees', 'total employees', 'number of employees'],
    fieldType: {
      type: 'input',
    },
    example: '150',
  },
] as const;
