import { isValidPhoneNumber } from 'libphonenumber-js';

import { Fields } from '@/spreadsheet-import/types';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconBriefcase,
  IconMail,
  IconMap,
  IconUser,
} from '@/ui/icon';

export const fieldsForPerson = [
  {
    icon: IconUser,
    label: 'Firstname',
    key: 'firstName',
    alternateMatches: ['first name', 'first', 'firstname'],
    fieldType: {
      type: 'input',
    },
    example: 'Tim',
  },
  {
    icon: IconUser,
    label: 'Lastname',
    key: 'lastName',
    alternateMatches: ['last name', 'last', 'lastname'],
    fieldType: {
      type: 'input',
    },
    example: 'Cook',
  },
  {
    icon: IconMail,
    label: 'Email',
    key: 'email',
    alternateMatches: ['email', 'mail'],
    fieldType: {
      type: 'input',
    },
    example: 'tim@apple.dev',
  },
  {
    icon: IconBrandLinkedin,
    label: 'Linkedin URL',
    key: 'linkedinUrl',
    alternateMatches: ['linkedIn', 'linkedin', 'linkedin url'],
    fieldType: {
      type: 'input',
    },
    example: 'https://www.linkedin.com/in/timcook',
  },
  {
    icon: IconBrandX,
    label: 'X URL',
    key: 'xUrl',
    alternateMatches: ['x', 'x url'],
    fieldType: {
      type: 'input',
    },
    example: 'https://x.com/tim_cook',
  },
  {
    icon: IconBriefcase,
    label: 'Job title',
    key: 'jobTitle',
    alternateMatches: ['job', 'job title'],
    fieldType: {
      type: 'input',
    },
    example: 'CEO',
  },
  {
    icon: IconBriefcase,
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
    icon: IconMap,
    label: 'City',
    key: 'city',
    fieldType: {
      type: 'input',
    },
    example: 'Seattle',
  },
] as Fields<string>;
