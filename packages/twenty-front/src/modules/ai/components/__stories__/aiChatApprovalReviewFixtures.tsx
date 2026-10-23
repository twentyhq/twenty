import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCurrencyDollar,
  IconMail,
  IconNumbers,
  IconPhone,
  IconUser,
} from 'twenty-ui/icon';

import { type AiChatApprovalReviewFixture } from '@/ai/components/__stories__/AiChatApprovalReviewFixture';

const APPROVAL_REVIEW_FIELD_ICON_SIZE = 12;

const PEOPLE_COLUMNS = [
  {
    id: 'name',
    label: 'People',
    icon: <IconUser size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />,
    width: 180,
  },
  {
    id: 'email',
    label: 'Email',
    icon: <IconMail size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />,
    width: 234,
  },
  {
    id: 'company',
    label: 'Company',
    icon: <IconBuildingSkyscraper size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />,
    width: 234,
  },
  {
    id: 'phone',
    label: 'Phone',
    icon: <IconPhone size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />,
    width: 234,
  },
  {
    id: 'job',
    label: 'Job',
    icon: <IconBriefcase size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />,
    width: 234,
  },
];

export const AI_CHAT_APPROVAL_REVIEW_FIXTURES: readonly AiChatApprovalReviewFixture[] =
  [
    {
      id: 'create-people',
      title: 'Create 3 people',
      approveVerb: 'Create',
      operation: 'create',
      columns: PEOPLE_COLUMNS,
      records: [
        {
          id: 'sundar',
          label: 'Sundar Pichai',
          values: {
            name: 'Sundar Pichai',
            email: 'sundar@google.com',
            company: 'Google',
            phone: '(920) 948-1722',
            job: 'CEO',
          },
        },
        {
          id: 'thomas',
          label: 'Thomas Kurian',
          values: {
            name: 'Thomas Kurian',
            email: 'thomas@google.com',
            company: 'Google',
            phone: '(256) 289-9707',
            job: 'Founder',
          },
        },
        {
          id: 'roelof',
          label: 'Roelof Botha',
          values: {
            name: 'Roelof Botha',
            email: 'roelof@sequoia.com',
            company: 'Sequoia',
            phone: '(347) 438-7215',
            job: 'Partner',
          },
        },
      ],
    },
    {
      id: 'update-companies',
      title: 'Update 2 companies',
      approveVerb: 'Update',
      operation: 'update',
      hint: 'Only changed fields are shown',
      columns: [
        {
          id: 'name',
          label: 'Companies',
          icon: (
            <IconBuildingSkyscraper size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />
          ),
          width: 180,
        },
        {
          id: 'arr',
          label: 'ARR',
          icon: <IconCurrencyDollar size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />,
          width: 243,
          align: 'right',
        },
        {
          id: 'employees',
          label: 'Employees',
          icon: <IconNumbers size={APPROVAL_REVIEW_FIELD_ICON_SIZE} />,
          width: 243,
          align: 'right',
        },
      ],
      records: [
        {
          id: 'stripe',
          label: 'Stripe',
          values: {
            name: 'Stripe',
            arr: '$2,100,000',
            employees: '9,000',
          },
          previousValues: { arr: '$1,800,000', employees: '8,500' },
        },
        {
          id: 'airbnb',
          label: 'Airbnb',
          values: {
            name: 'Airbnb',
            arr: '$4,500,000',
            employees: '8,200',
          },
          previousValues: { arr: '$4,200,000' },
        },
      ],
    },
    {
      id: 'delete-people',
      title: 'Delete 2 people',
      approveVerb: 'Delete',
      operation: 'delete',
      hint: 'You can restore them from the Trash',
      columns: PEOPLE_COLUMNS,
      records: [
        {
          id: 'reid',
          label: 'Reid Hoffman',
          values: {
            name: 'Reid Hoffman',
            email: 'reid@linkedin.com',
            company: 'LinkedIn',
            phone: '(907) 248-8330',
            job: 'Partner',
          },
        },
        {
          id: 'stewart',
          label: 'Stewart Butterfield',
          values: {
            name: 'Stewart Butterfield',
            email: 'stewart@slack.com',
            company: 'Slack',
            phone: '(617) 623-2338',
            job: 'CEO',
          },
        },
      ],
    },
  ];
