import {
  IconBrandLinkedin,
  IconBrandX,
  IconBuildingSkyscraper,
  IconMail,
  IconMap,
  IconMoneybag,
  IconTarget,
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
    icon: <IconMoneybag />,
    label: 'ARR',
    key: 'annualRecurringRevenue',
    alternateMatches: [
      'arr',
      'annual revenue',
      'revenue',
      'recurring revenue',
      'annual recurring revenue',
    ],
    fieldType: {
      type: 'input',
    },
    validation: [
      {
        regex: /^(\d+)?$/,
        errorMessage: 'Annual recurring revenue must be a number',
        level: 'error',
      },
    ],
    example: '1000000',
  },
  {
    icon: <IconTarget />,
    label: 'ICP',
    key: 'idealCustomerProfile',
    alternateMatches: [
      'icp',
      'ideal profile',
      'ideal customer profile',
      'ideal customer',
    ],
    fieldType: {
      type: 'input',
    },
    validation: [
      {
        regex: /^(true|false)?$/,
        errorMessage: 'Ideal custoner profile must be a boolean',
        level: 'error',
      },
    ],
    example: 'true/false',
  },
  {
    icon: <IconBrandX />,
    label: 'x URL',
    key: 'xUrl',
    alternateMatches: ['x', 'twitter', 'twitter url', 'x url'],
    fieldType: {
      type: 'input',
    },
    example: 'https://x.com/tim_cook',
  },
  {
    icon: <IconMap />,
    label: 'Address',
    key: 'address',
    fieldType: {
      type: 'input',
    },
    example: 'Maple street',
  },
  {
    icon: <IconUsers />,
    label: 'Employees',
    key: 'employees',
    alternateMatches: ['employees', 'total employees', 'number of employees'],
    fieldType: {
      type: 'input',
    },
    validation: [
      {
        regex: /^\d+$/,
        errorMessage: 'Employees must be a number',
        level: 'error',
      },
    ],
    example: '150',
  },
] as const;
