import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

// Keep function wrappers as aliases for backward compatibility — they just
// return the pre-computed constants so callers can be migrated gradually.
export const getWorkflowMock = () => mockedWorkflow;
export const getWorkflowVersionsMock = () => mockedWorkflowVersions;
export const getWorkflowNodeIdMock = () => mockedWorkflowNodeId;

export const MOCKED_STEP_ID = '04d5f3bf-9714-400d-ba27-644006a5fb1b';

const MOCKED_COMPANY_RECORD_OUTPUT_SCHEMA = {
  fields: {
    id: {
      icon: 'Icon123',
      type: 'UUID',
      label: 'Id',
      value: '123e4567-e89b-12d3-a456-426614174000',
      isLeaf: true,
    },
    name: {
      icon: 'IconBuildingSkyscraper',
      type: 'TEXT',
      label: 'Name',
      value: 'My text',
      isLeaf: true,
    },
    xLink: {
      icon: 'IconBrandX',
      label: 'X',
      value: {
        primaryLinkUrl: {
          type: 'TEXT',
          label: 'Primary Link Url',
          value: 'My text',
          isLeaf: true,
        },
        secondaryLinks: {
          type: 'RAW_JSON',
          label: 'Secondary Links',
          value: null,
          isLeaf: true,
        },
        primaryLinkLabel: {
          type: 'TEXT',
          label: 'Primary Link Label',
          value: 'My text',
          isLeaf: true,
        },
      },
      isLeaf: false,
    },
    address: {
      icon: 'IconMap',
      label: 'Address',
      value: {
        addressLat: {
          type: 'NUMERIC',
          label: 'Address Lat',
          value: null,
          isLeaf: true,
        },
        addressLng: {
          type: 'NUMERIC',
          label: 'Address Lng',
          value: null,
          isLeaf: true,
        },
        addressCity: {
          type: 'TEXT',
          label: 'Address City',
          value: 'My text',
          isLeaf: true,
        },
        addressState: {
          type: 'TEXT',
          label: 'Address State',
          value: 'My text',
          isLeaf: true,
        },
        addressCountry: {
          type: 'TEXT',
          label: 'Address Country',
          value: 'My text',
          isLeaf: true,
        },
        addressStreet1: {
          type: 'TEXT',
          label: 'Address Street1',
          value: 'My text',
          isLeaf: true,
        },
        addressStreet2: {
          type: 'TEXT',
          label: 'Address Street2',
          value: 'My text',
          isLeaf: true,
        },
        addressPostcode: {
          type: 'TEXT',
          label: 'Address Postcode',
          value: 'My text',
          isLeaf: true,
        },
      },
      isLeaf: false,
    },
    tagline: {
      icon: 'IconAdCircle',
      type: 'TEXT',
      label: 'Tagline',
      value: 'My text',
      isLeaf: true,
    },
    createdAt: {
      icon: 'IconCalendar',
      type: 'DATE_TIME',
      label: 'Creation date',
      value: '01/23/2025 15:16',
      isLeaf: true,
    },
    createdBy: {
      icon: 'IconCreativeCommonsSa',
      label: 'Created by',
      value: {
        name: {
          type: 'TEXT',
          label: 'Name',
          value: 'My text',
          isLeaf: true,
        },
        source: {
          type: 'SELECT',
          label: 'Source',
          value: null,
          isLeaf: true,
        },
        workspaceMemberId: {
          type: 'UUID',
          label: 'Workspace Member Id',
          value: '123e4567-e89b-12d3-a456-426614174000',
          isLeaf: true,
        },
      },
      isLeaf: false,
    },
    deletedAt: {
      icon: 'IconCalendarMinus',
      type: 'DATE_TIME',
      label: 'Deleted at',
      value: '01/23/2025 15:16',
      isLeaf: true,
    },
    employees: {
      icon: 'IconUsers',
      type: 'NUMBER',
      label: 'Employees',
      value: 20,
      isLeaf: true,
    },
    updatedAt: {
      icon: 'IconCalendarClock',
      type: 'DATE_TIME',
      label: 'Last update',
      value: '01/23/2025 15:16',
      isLeaf: true,
    },
    domainName: {
      icon: 'IconLink',
      label: 'Domain Name',
      value: {
        primaryLinkUrl: {
          type: 'TEXT',
          label: 'Primary Link Url',
          value: 'My text',
          isLeaf: true,
        },
        secondaryLinks: {
          type: 'RAW_JSON',
          label: 'Secondary Links',
          value: null,
          isLeaf: true,
        },
        primaryLinkLabel: {
          type: 'TEXT',
          label: 'Primary Link Label',
          value: 'My text',
          isLeaf: true,
        },
      },
      isLeaf: false,
    },
    introVideo: {
      icon: 'IconVideo',
      label: 'Intro Video',
      value: {
        primaryLinkUrl: {
          type: 'TEXT',
          label: 'Primary Link Url',
          value: 'My text',
          isLeaf: true,
        },
        secondaryLinks: {
          type: 'RAW_JSON',
          label: 'Secondary Links',
          value: null,
          isLeaf: true,
        },
        primaryLinkLabel: {
          type: 'TEXT',
          label: 'Primary Link Label',
          value: 'My text',
          isLeaf: true,
        },
      },
      isLeaf: false,
    },
    workPolicy: {
      icon: 'IconHome',
      type: 'MULTI_SELECT',
      label: 'Work Policy',
      value: null,
      isLeaf: true,
    },
    linkedinLink: {
      icon: 'IconBrandLinkedin',
      label: 'Linkedin',
      value: {
        primaryLinkUrl: {
          type: 'TEXT',
          label: 'Primary Link Url',
          value: 'My text',
          isLeaf: true,
        },
        secondaryLinks: {
          type: 'RAW_JSON',
          label: 'Secondary Links',
          value: null,
          isLeaf: true,
        },
        primaryLinkLabel: {
          type: 'TEXT',
          label: 'Primary Link Label',
          value: 'My text',
          isLeaf: true,
        },
      },
      isLeaf: false,
    },
    visaSponsorship: {
      icon: 'IconBrandVisa',
      type: 'BOOLEAN',
      label: 'Visa Sponsorship',
      value: true,
      isLeaf: true,
    },
    idealCustomerProfile: {
      icon: 'IconTarget',
      type: 'BOOLEAN',
      label: 'ICP',
      value: true,
      isLeaf: true,
    },
    annualRecurringRevenue: {
      icon: 'IconMoneybag',
      label: 'ARR',
      value: {
        amountMicros: {
          type: 'NUMERIC',
          label: 'Amount Micros',
          value: null,
          isLeaf: true,
        },
        currencyCode: {
          type: 'TEXT',
          label: 'Currency Code',
          value: 'My text',
          isLeaf: true,
        },
      },
      isLeaf: false,
    },
  },
  object: {
    icon: 'IconBuildingSkyscraper',
    label: 'Company',
    value: 'A company',
    isLeaf: true,
    fieldIdName: 'id',
    nameSingular: 'company',
  },
  _outputSchemaType: 'RECORD',
};

// a record event trigger prefixes each field key with its event path, as the server computes it
const MOCKED_COMPANY_CREATED_TRIGGER_OUTPUT_SCHEMA = {
  ...MOCKED_COMPANY_RECORD_OUTPUT_SCHEMA,
  fields: Object.fromEntries(
    Object.entries(MOCKED_COMPANY_RECORD_OUTPUT_SCHEMA.fields).map(
      ([key, field]) => [`properties.after.${key}`, field],
    ),
  ),
};

export const workflowQueryResult = {
  workflows: {
    __typename: 'WorkflowConnection',
    totalCount: 1,
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor:
        'eyJwb3NpdGlvbiI6MCwiaWQiOiIyMWQ0NzcyOC0wMmE3LTQzMjEtOWVhNC00NDk3N2MzOTU3OTMifQ==',
      endCursor:
        'eyJwb3NpdGlvbiI6MCwiaWQiOiIyMWQ0NzcyOC0wMmE3LTQzMjEtOWVhNC00NDk3N2MzOTU3OTMifQ==',
    },
    edges: [
      {
        __typename: 'WorkflowEdge',
        cursor:
          'eyJwb3NpdGlvbiI6MCwiaWQiOiIyMWQ0NzcyOC0wMmE3LTQzMjEtOWVhNC00NDk3N2MzOTU3OTMifQ==',
        node: {
          __typename: 'Workflow',
          deletedAt: null,
          id: '21d47728-02a7-4321-9ea4-44977c395793',
          name: 'Test',
          position: 0,
          statuses: ['DRAFT'],
          updatedAt: '2025-01-30T09:54:36.006Z',
          createdBy: {
            __typename: 'Actor',
            source: 'MANUAL',
            workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
            name: 'Tim Apple',
          },
          runs: {
            __typename: 'WorkflowRunConnection',
            edges: [],
          },
          versions: {
            __typename: 'WorkflowVersionConnection',
            edges: [
              {
                __typename: 'WorkflowVersionEdge',
                node: {
                  __typename: 'WorkflowVersion',
                  createdAt: '2025-01-30T09:54:34.583Z',
                  deletedAt: null,
                  id: 'e7ee024c-ea25-4558-84b8-6c3533f0c9a5',
                  name: 'v1',
                  position: -1,
                  status: 'DRAFT',
                  steps: [
                    {
                      id: MOCKED_STEP_ID,
                      name: 'Create Record',
                      type: 'CREATE_RECORD',
                      valid: false,
                      settings: {
                        input: {
                          objectName: 'opportunity',
                          objectRecord: {
                            name: 'Opportunity – {{trigger.properties.after.name}}',
                            amount: {
                              amountMicros: 1000000000,
                              currencyCode: 'EUR',
                            },
                          },
                        },
                        outputSchema: {
                          fields: {
                            id: {
                              icon: 'Icon123',
                              type: 'UUID',
                              label: 'Id',
                              value: '123e4567-e89b-12d3-a456-426614174000',
                              isLeaf: true,
                            },
                            name: {
                              icon: 'IconTargetArrow',
                              type: 'TEXT',
                              label: 'Name',
                              value: 'My text',
                              isLeaf: true,
                            },
                            fullName: {
                              icon: 'IconTargetArrow',
                              type: 'TEXT',
                              label: 'Full Name',
                              isLeaf: false,
                              value: {
                                firstName: {
                                  icon: 'IconTargetArrow',
                                  type: 'TEXT',
                                  label: 'Full Name First Name',
                                  value: 'John',
                                  isLeaf: true,
                                },
                                lastName: {
                                  icon: 'IconTargetArrow',
                                  type: 'TEXT',
                                  label: 'Full Name Last Name',
                                  value: 'Doe',
                                  isLeaf: true,
                                },
                              },
                            },
                            stage: {
                              icon: 'IconProgressCheck',
                              type: 'SELECT',
                              label: 'Stage',
                              value: null,
                              isLeaf: true,
                            },
                            amount: {
                              icon: 'IconCurrencyDollar',
                              label: 'Amount',
                              value: {
                                amountMicros: {
                                  type: 'NUMERIC',
                                  label: 'Amount Micros',
                                  value: null,
                                  isLeaf: true,
                                },
                                currencyCode: {
                                  type: 'TEXT',
                                  label: 'Currency Code',
                                  value: 'My text',
                                  isLeaf: true,
                                },
                              },
                              isLeaf: false,
                            },
                            closeDate: {
                              icon: 'IconCalendarEvent',
                              type: 'DATE_TIME',
                              label: 'Close date',
                              value: '01/23/2025 15:16',
                              isLeaf: true,
                            },
                            createdAt: {
                              icon: 'IconCalendar',
                              type: 'DATE_TIME',
                              label: 'Creation date',
                              value: '01/23/2025 15:16',
                              isLeaf: true,
                            },
                            createdBy: {
                              icon: 'IconCreativeCommonsSa',
                              label: 'Created by',
                              value: {
                                name: {
                                  type: 'TEXT',
                                  label: ' Name',
                                  value: 'My text',
                                  isLeaf: true,
                                },
                                source: {
                                  type: 'SELECT',
                                  label: ' Source',
                                  value: null,
                                  isLeaf: true,
                                },
                                workspaceMemberId: {
                                  type: 'UUID',
                                  label: ' Workspace Member Id',
                                  value: '123e4567-e89b-12d3-a456-426614174000',
                                  isLeaf: true,
                                },
                              },
                              isLeaf: false,
                            },
                            deletedAt: {
                              icon: 'IconCalendarMinus',
                              type: 'DATE_TIME',
                              label: 'Deleted at',
                              value: '01/23/2025 15:16',
                              isLeaf: true,
                            },
                            updatedAt: {
                              icon: 'IconCalendarClock',
                              type: 'DATE_TIME',
                              label: 'Last update',
                              value: '01/23/2025 15:16',
                              isLeaf: true,
                            },
                            salary: {
                              icon: 'IconMoneybag',
                              type: 'NUMBER',
                              label: 'Salary',
                              value: 1000000000,
                              isLeaf: true,
                            },
                            address: {
                              isLeaf: false,
                              value: {
                                street1: {
                                  isLeaf: true,
                                  label: 'Street 1',
                                  value: '123 Main St',
                                },
                                street2: {
                                  isLeaf: true,
                                  label: 'Street 2',
                                  value: 'Apt 1',
                                },
                                city: {
                                  isLeaf: true,
                                  label: 'My City',
                                  value: 'San Francisco',
                                },
                                state: {
                                  isLeaf: true,
                                  label: 'My State',
                                  value: 'CA',
                                },
                                country: {
                                  isLeaf: true,
                                  label: 'My Country',
                                  value: 'United States',
                                },
                                postcode: {
                                  isLeaf: true,
                                  label: 'My Postcode',
                                  value: '94101',
                                },
                                lat: {
                                  isLeaf: true,
                                  label: 'My Lat',
                                  value: 37.774929,
                                },
                                lng: {
                                  isLeaf: true,
                                  label: 'My Lng',
                                  value: -122.419418,
                                },
                              },
                            },
                            phone: {
                              isLeaf: false,
                              label: 'Phone',
                              value: {
                                countryCode: {
                                  isLeaf: true,
                                  label: 'My Country Code',
                                  value: '+1',
                                },
                                number: {
                                  isLeaf: true,
                                  label: 'My Number',
                                  value: '1234567890',
                                },
                              },
                            },
                          },
                          object: {
                            icon: 'IconTargetArrow',
                            label: 'Opportunity',
                            value: 'An opportunity',
                            isLeaf: true,
                            fieldIdName: 'id',
                            nameSingular: 'opportunity',
                          },
                          _outputSchemaType: 'RECORD',
                        },
                        errorHandlingOptions: {
                          retryOnFailure: {
                            value: 0,
                          },
                          continueOnFailure: {
                            value: false,
                          },
                        },
                      },
                      __typename: 'WorkflowAction',
                    },
                  ],
                  trigger: {
                    type: 'DATABASE_EVENT',
                    settings: {
                      eventName: 'company.created',
                      outputSchema:
                        MOCKED_COMPANY_CREATED_TRIGGER_OUTPUT_SCHEMA,
                    },
                  },
                  updatedAt: '2025-01-30T14:08:04.703Z',
                  workflowId: '21d47728-02a7-4321-9ea4-44977c395793',
                },
              },
            ],
          },
        },
      },
    ],
  },
} satisfies { workflows: RecordGqlConnection };

export const mockedWorkflow = workflowQueryResult.workflows.edges[0].node;

export const mockedWorkflowVersion = mockedWorkflow.versions.edges[0].node;

export const mockedWorkflowVersions = {
  ...mockedWorkflow.versions,
  __typename: 'WorkflowVersionConnection' as const,
  totalCount: 1,
  pageInfo: {
    __typename: 'PageInfo' as const,
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor:
      'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
    endCursor:
      'eyJjcmVhdGVkQXQiOiIyMDI0LTA5LTE5VDEwOjEwOjA0LjcyNVoiLCJpZCI6ImY2MTg4NDNhLTI2YmUtNGE1NC1hNjBmLWY0Y2U4OGE1OTRmMCJ9',
  },
};

export const mockedWorkflowNodeId = mockedWorkflowVersion.steps[0].id;
