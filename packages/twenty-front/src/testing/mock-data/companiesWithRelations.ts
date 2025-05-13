import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

const FIND_MANY_COMPANIES_WITH_RELATION_QUERY_RESULT = {
  data: {
    companies: {
      __typename: 'CompanyConnection',
      totalCount: 13,
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor:
          'eyJwb3NpdGlvbiI6MSwiaWQiOiIyMDIwMjAyMC0zZWMzLTRmZTMtODk5Ny1iNzZhYTBiZmE0MDgifQ==',
        endCursor:
          'eyJwb3NpdGlvbiI6MTMsImlkIjoiMjAyMDIwMjAtMTQ1NS00YzU3LWFmYWYtZGQ1ZGMwODYzNjFkIn0=',
      },
      edges: [
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6MSwiaWQiOiIyMDIwMjAyMC0zZWMzLTRmZTMtODk5Ny1iNzZhYTBiZmE0MDgifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 5000,
            id: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
            name: 'Nubank',
            position: 1,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Juscelino Kubitschek',
              addressStreet2: '2041',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '04543-011',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://nubank.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/nubank',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6MiwiaWQiOiIyMDIwMjAyMC01ZDgxLTQ2ZDYtYmY4My1mN2ZkMzNlYTYxMDIifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 10000,
            id: '20202020-5d81-46d6-bf83-f7fd33ea6102',
            name: 'Itaú Unibanco',
            position: 2,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Eng. Armando de Arruda Pereira',
              addressStreet2: '707',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '04311-909',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://itau.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/itau',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6MywiaWQiOiIyMDIwMjAyMC0wNzEzLTQwYTUtODIxNi04MjgwMjQwMWQzM2UifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 8000,
            id: '20202020-0713-40a5-8216-82802401d33e',
            name: 'Bradesco',
            position: 3,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Cidade de Deus',
              addressStreet2: 's/n',
              addressCity: 'Osasco',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '06029-900',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://bradesco.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/bradesco',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6NCwiaWQiOiIyMDIwMjAyMC1lZDg5LTQxM2EtYjMxYS05NjI5ODZlNjdiYjQifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 12000,
            id: '20202020-ed89-413a-b31a-962986e67bb4',
            name: 'Caixa Econômica Federal',
            position: 4,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'SBS Quadra 4',
              addressStreet2: 'Lote 3/4',
              addressCity: 'Brasília',
              addressState: 'DF',
              addressCountry: 'Brasil',
              addressPostcode: '70092-900',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://caixa.gov.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/caixa',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6NSwiaWQiOiIyMDIwMjAyMC0xNzFlLTRiY2MtOWNmNy00MzQ0OGQ2ZmIyNzgiXQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 6000,
            id: '20202020-171e-4bcc-9cf7-43448d6fb278',
            name: 'Banco do Brasil',
            position: 5,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'SAUN Quadra 5',
              addressStreet2: 'Lote B',
              addressCity: 'Brasília',
              addressState: 'DF',
              addressCountry: 'Brasil',
              addressPostcode: '70040-912',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://bb.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/banco-do-brasil',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6NiwiaWQiOiIyMDIwMjAyMC1jMjFlLTRlYzItODczYi1kZTQyNjRkODkwMjUifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 4000,
            id: '20202020-c21e-4ec2-873b-de4264d89025',
            name: 'Santander',
            position: 6,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Pres. Juscelino Kubitschek',
              addressStreet2: '2041',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '04543-011',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://santander.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/santander-brasil',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6NywiaWQiOiIyMDIwMjAyMC03MDdlLTQ0ZGMtYTFkMi0zMDAzMGJmMWE5NDQifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 3000,
            id: '20202020-707e-44dc-a1d2-30030bf1a944',
            name: 'Banco Inter',
            position: 7,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Barbacena',
              addressStreet2: '1212',
              addressCity: 'Belo Horizonte',
              addressState: 'MG',
              addressCountry: 'Brasil',
              addressPostcode: '30190-131',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://bancointer.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/bancointer',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6OCwiaWQiOiIyMDIwMjAyMC0zZjc0LTQ5MmQtYTEwMS0yYTcwZjUwYTE2NDUifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 2500,
            id: '20202020-3f74-492d-a101-2a70f50a1645',
            name: 'Banco Pan',
            position: 8,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Paulista',
              addressStreet2: '1000',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '01310-100',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://bancopan.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/bancopan',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6OSwiaWQiOiIyMDIwMjAyMC1jZmJmLTQxNTYtYTc5MC1lMzk4NTRkY2Q0ZWIifQ==',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 2000,
            id: '20202020-cfbf-4156-a790-e39854dcd4eb',
            name: 'Banco Safra',
            position: 9,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Paulista',
              addressStreet2: '2150',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '01310-300',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://safra.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/bancosafra',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6MTAsImlkIjoiMjAyMDIwMjAtZjg2Yi00MTlmLWI3OTQtMDIzMTlhYmU4NjM3In0=',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 1800,
            id: '20202020-f86b-419f-b794-02319abe8637',
            name: 'Banco Original',
            position: 10,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Brigadeiro Faria Lima',
              addressStreet2: '2232',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '01452-002',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://original.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/bancooriginal',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6MTEsImlkIjoiMjAyMDIwMjAtNTUxOC00NTUzLTk0MzMtNDJkOGViODI4MzRiIn0=',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 1500,
            id: '20202020-5518-4553-9433-42d8eb82834b',
            name: 'Banco Daycoval',
            position: 11,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Paulista',
              addressStreet2: '1000',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '01310-100',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://daycoval.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/bancodaycoval',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6MTIsImlkIjoiMjAyMDIwMjAtZjc5ZS00MGRkLWJkMDYtYzM2ZTZhYmI0Njc4In0=',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 1200,
            id: '20202020-f79e-40dd-bd06-c36e6abb4678',
            name: 'Banco BMG',
            position: 12,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Rua Cláudio Manoel da Costa',
              addressStreet2: '621',
              addressCity: 'Belo Horizonte',
              addressState: 'MG',
              addressCountry: 'Brasil',
              addressPostcode: '30140-100',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://bancobmg.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/bancobmg',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
        {
          __typename: 'CompanyEdge',
          cursor:
            'eyJwb3NpdGlvbiI6MTMsImlkIjoiMjAyMDIwMjAtMTQ1NS00YzU3LWFmYWYtZGQ1ZGMwODYzNjFkIn0=',
          node: {
            __typename: 'Company',
            accountOwner: null,
            createdAt: '2025-02-16T08:21:51.715Z',
            deletedAt: null,
            employees: 1000,
            id: '20202020-1455-4c57-afaf-dd5dc086361d',
            name: 'Banco C6',
            position: 13,
            people: {
              __typename: 'PersonConnection',
              edges: [],
            },
            address: {
              __typename: 'Address',
              addressStreet1: 'Av. Nove de Julho',
              addressStreet2: '3186',
              addressCity: 'São Paulo',
              addressState: 'SP',
              addressCountry: 'Brasil',
              addressPostcode: '01406-000',
              addressLat: null,
              addressLng: null,
            },
            createdBy: {
              __typename: 'Actor',
              source: 'MANUAL',
              workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
              name: 'Tim Apple',
              context: {},
            },
            domainName: {
              __typename: 'Links',
              primaryLinkUrl: 'https://c6bank.com.br',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            linkedinLink: {
              __typename: 'Links',
              primaryLinkUrl: 'linkedin.com/company/c6bank',
              primaryLinkLabel: '',
              secondaryLinks: [],
            },
            noteTargets: {
              __typename: 'NoteTargetConnection',
              edges: [],
            },
            taskTargets: {
              __typename: 'TaskTargetConnection',
              edges: [],
            },
          },
        },
      ],
    },
  },
  loading: false,
  networkStatus: 7,
} as const;

export const allMockCompanyRecordsWithRelation =
  FIND_MANY_COMPANIES_WITH_RELATION_QUERY_RESULT.data.companies.edges.map(
    (edge) => getRecordFromRecordNode({ recordNode: edge.node }),
  );

export const getMockCompanyWithRelationRecord = (
  overrides?: Partial<ObjectRecord>,
  index = 0,
) => {
  return {
    ...allMockCompanyRecordsWithRelation[index],
    ...overrides,
  };
};

export const findMockCompanyWithRelationRecord = ({
  id: queriedCompanyId,
}: Pick<ObjectRecord, 'id'>) => {
  const company = allMockCompanyRecordsWithRelation.find(
    ({ id: currentCompanyId }) => currentCompanyId === queriedCompanyId,
  );

  if (!isDefined(company)) {
    throw new Error(`Could not find company with id, ${queriedCompanyId}`);
  }

  return company;
};
