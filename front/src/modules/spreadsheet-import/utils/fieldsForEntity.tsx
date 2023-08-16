import { isValidPhoneNumber } from 'libphonenumber-js';

import {
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconMail,
  IconMap,
  IconUser,
  IconUsers,
} from '@/ui/icon';

export const fieldsForEntity = {
  Person: [
    {
      icon: <IconUser />,
      label: 'Firstname',
      key: 'firstName',
      alternateMatches: ['first name', 'first', 'firstname'],
      fieldType: {
        type: 'input',
      },
      example: 'Tim',
      validations: [
        {
          rule: 'required',
          errorMessage: 'Firstname is required',
          level: 'error',
        },
      ],
    },
    {
      icon: <IconUser />,
      label: 'Lastname',
      key: 'lastName',
      alternateMatches: ['last name', 'last', 'lastname'],
      fieldType: {
        type: 'input',
      },
      example: 'Cook',
      validations: [
        {
          rule: 'required',
          errorMessage: 'Lastname is required',
          level: 'error',
        },
      ],
    },
    {
      icon: <IconMail />,
      label: 'Email',
      key: 'email',
      alternateMatches: ['email', 'mail'],
      fieldType: {
        type: 'input',
      },
      example: 'tim@apple.dev',
      validations: [
        {
          rule: 'required',
          errorMessage: 'email is required',
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
      example: 'https://www.linkedin.com/in/timcook',
    },
    {
      icon: <IconBrandTwitter />,
      label: 'X URL',
      key: 'xUrl',
      alternateMatches: ['x', 'x url'],
      fieldType: {
        type: 'input',
      },
      example: 'https://x.com/tim_cook',
    },
    {
      icon: <IconBriefcase />,
      label: 'Job title',
      key: 'jobTitle',
      alternateMatches: ['job', 'job title'],
      fieldType: {
        type: 'input',
      },
      example: 'CEO',
    },
    {
      icon: <IconBriefcase />,
      label: 'Phone',
      key: 'phone',
      fieldType: {
        type: 'input',
      },
      example: '+1234567890',
      validations: [
        {
          rule: 'function',
          isValid: (value: string) => isValidPhoneNumber(value),
          errorMessage: 'phone is not valid',
          level: 'error',
        },
      ],
    },
    {
      icon: <IconMap />,
      label: 'City',
      key: 'city',
      fieldType: {
        type: 'input',
      },
      example: 'Seattle',
    },
  ],
  Company: [
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
      icon: <IconUser />,
      label: 'Lastname',
      key: 'lastName',
      alternateMatches: ['last name', 'last', 'lastname'],
      fieldType: {
        type: 'input',
      },
      example: 'Apple',
      validations: [
        {
          rule: 'required',
          errorMessage: 'Lastname is required',
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
  ],
} as const;
