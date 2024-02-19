import { Company } from '@/companies/types/Company';
import { Favorite } from '@/favorites/types/Favorite';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { Person } from '@/people/types/Person';

export const emptyConnectionMock: ObjectRecordConnection = {
  edges: [],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  },
  totalCount: 0,
  __typename: 'ObjectRecordConnection',
};

export const companiesConnectionWithPeopleConnectionWithFavoritesConnectionMock: ObjectRecordConnection<
  Partial<Company> &
    Pick<Company, 'id'> & {
      people: ObjectRecordConnection<
        Pick<Person, 'id' | 'name'> & {
          favorites: ObjectRecordConnection<
            Pick<Favorite, 'id' | 'personId' | 'companyId' | 'position'>
          >;
        }
      >;
    }
> = {
  pageInfo: {
    endCursor: 'WyJmZTI1NmIzOS0zZWMzLTRmZTMtODk5Ny1iNzZhYTBiZmE0MDgiXQ==',
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: 'WyIwNGIyZTlmNS0wNzEzLTQwYTUtODIxNi04MjgwMjQwMWQzM2UiXQ==',
  },
  edges: [
    {
      cursor: 'WyIwNGIyZTlmNS0wNzEzLTQwYTUtODIxNi04MjgwMjQwMWQzM2UiXQ==',
      node: {
        id: '04b2e9f5-0713-40a5-8216-82802401d33e',
        name: 'Qonto',
        people: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
          totalCount: 0,
        },
      },
    },
    {
      cursor: 'WyIwZDk0MDk5Ny1jMjFlLTRlYzItODczYi1kZTQyNjRkODkwMjUiXQ==',
      node: {
        id: '0d940997-c21e-4ec2-873b-de4264d89025',
        name: 'Google',
        people: {
          edges: [
            {
              cursor:
                'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkwZGYiXQ==',
              node: {
                id: '240da2ec-2d40-4e49-8df4-9c6a049190df',
                name: {
                  firstName: 'Bertrand',
                  lastName: 'Voulzy',
                },
                favorites: {
                  edges: [
                    {
                      cursor:
                        'WyJjODVhODY3Yy01YThmLTQ4NjEtOGVkMi05NmMzOTAyNDg0MjMiXQ==',
                      node: {
                        id: 'c85a867c-5a8f-4861-8ed2-96c390248423',
                        personId: '240da2ec-2d40-4e49-8df4-9c6a049190df',
                        companyId: null,
                        position: 2,
                      },
                    },
                  ],
                  pageInfo: {
                    endCursor:
                      'WyJjODVhODY3Yy01YThmLTQ4NjEtOGVkMi05NmMzOTAyNDg0MjMiXQ==',
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor:
                      'WyJjODVhODY3Yy01YThmLTQ4NjEtOGVkMi05NmMzOTAyNDg0MjMiXQ==',
                  },
                  totalCount: 1,
                },
              },
            },
            {
              cursor:
                'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkwZWYiXQ==',
              node: {
                id: '240da2ec-2d40-4e49-8df4-9c6a049190ef',
                name: {
                  firstName: 'Madison',
                  lastName: 'Perez',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
            {
              cursor:
                'WyI1Njk1NTQyMi01ZDU0LTQxYjctYmEzNi1mMGQyMGUxNDE3YWUiXQ==',
              node: {
                id: '56955422-5d54-41b7-ba36-f0d20e1417ae',
                name: {
                  firstName: 'Avery',
                  lastName: 'Carter',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
            {
              cursor:
                'WyI3NTUwMzVkYi02MjNkLTQxZmUtOTJlNy1kZDQ1YjdjNTY4ZTEiXQ==',
              node: {
                id: '755035db-623d-41fe-92e7-dd45b7c568e1',
                name: {
                  firstName: 'Ethan',
                  lastName: 'Mitchell',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
            {
              cursor:
                'WyJhMmU3OGE1Zi0zMzhiLTQ2ZGYtODgxMS1mYTA4YzdkMTlkMzUiXQ==',
              node: {
                id: 'a2e78a5f-338b-46df-8811-fa08c7d19d35',
                name: {
                  firstName: 'Elizabeth',
                  lastName: 'Baker',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
            {
              cursor:
                'WyJjYTFmNWJmMy02NGFkLTRiMGUtYmJmZC1lOWZkNzk1YjcwMTYiXQ==',
              node: {
                id: 'ca1f5bf3-64ad-4b0e-bbfd-e9fd795b7016',
                name: {
                  firstName: 'Christopher',
                  lastName: 'Nelson',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
          ],
          pageInfo: {
            endCursor:
              'WyJjYTFmNWJmMy02NGFkLTRiMGUtYmJmZC1lOWZkNzk1YjcwMTYiXQ==',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkwZGYiXQ==',
          },
          totalCount: 6,
        },
      },
    },
    {
      cursor: 'WyIxMTg5OTVmMy01ZDgxLTQ2ZDYtYmY4My1mN2ZkMzNlYTYxMDIiXQ==',
      node: {
        id: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
        name: 'Facebook',
        people: {
          edges: [
            {
              cursor:
                'WyI5M2M3MmQyZS1mNTE3LTQyZmQtODBhZS0xNDE3M2IzYjcwYWUiXQ==',
              node: {
                id: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
                name: {
                  firstName: 'Christopher',
                  lastName: 'Gonzalez',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
            {
              cursor:
                'WyJlZWVhY2FjZi1lZWUxLTQ2OTAtYWQyYy04NjE5ZTViNTZhMmUiXQ==',
              node: {
                id: 'eeeacacf-eee1-4690-ad2c-8619e5b56a2e',
                name: {
                  firstName: 'Ashley',
                  lastName: 'Parker',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
          ],
          pageInfo: {
            endCursor:
              'WyJlZWVhY2FjZi1lZWUxLTQ2OTAtYWQyYy04NjE5ZTViNTZhMmUiXQ==',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'WyI5M2M3MmQyZS1mNTE3LTQyZmQtODBhZS0xNDE3M2IzYjcwYWUiXQ==',
          },
          totalCount: 2,
        },
      },
    },
    {
      cursor: 'WyIxZDNhMWM2ZS03MDdlLTQ0ZGMtYTFkMi0zMDAzMGJmMWE5NDQiXQ==',
      node: {
        id: '1d3a1c6e-707e-44dc-a1d2-30030bf1a944',
        name: 'Netflix',
        people: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
          totalCount: 0,
        },
      },
    },
    {
      cursor: 'WyI0NjBiNmZiMS1lZDg5LTQxM2EtYjMxYS05NjI5ODZlNjdiYjQiXQ==',
      node: {
        id: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        name: 'Microsoft',
        people: {
          edges: [
            {
              cursor:
                'WyIxZDE1MTg1Mi00OTBmLTQ0NjYtODM5MS03MzNjZmQ2NmEwYzgiXQ==',
              node: {
                id: '1d151852-490f-4466-8391-733cfd66a0c8',
                name: {
                  firstName: 'Isabella',
                  lastName: 'Scott',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
            {
              cursor:
                'WyI5ODQwNmUyNi04MGYxLTRkZmYtYjU3MC1hNzQ5NDI1MjhkZTMiXQ==',
              node: {
                id: '98406e26-80f1-4dff-b570-a74942528de3',
                name: {
                  firstName: 'Matthew',
                  lastName: 'Green',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
            {
              cursor:
                'WyI5YjMyNGE4OC02Nzg0LTQ0NDktYWZkZi1kYzYyY2I4NzAyZjIiXQ==',
              node: {
                id: '9b324a88-6784-4449-afdf-dc62cb8702f2',
                name: {
                  firstName: 'Nicholas',
                  lastName: 'Wright',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
          ],
          pageInfo: {
            endCursor:
              'WyI5YjMyNGE4OC02Nzg0LTQ0NDktYWZkZi1kYzYyY2I4NzAyZjIiXQ==',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'WyIxZDE1MTg1Mi00OTBmLTQ0NjYtODM5MS03MzNjZmQ2NmEwYzgiXQ==',
          },
          totalCount: 3,
        },
      },
    },
    {
      cursor: 'WyI3YTkzZDFlNS0zZjc0LTQ5MmQtYTEwMS0yYTcwZjUwYTE2NDUiXQ==',
      node: {
        id: '7a93d1e5-3f74-492d-a101-2a70f50a1645',
        name: 'Libeo',
        people: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
          totalCount: 0,
        },
      },
    },
    {
      cursor: 'WyI4OWJiODI1Yy0xNzFlLTRiY2MtOWNmNy00MzQ0OGQ2ZmIyNzgiXQ==',
      node: {
        id: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
        name: 'Airbnb',
        people: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
          totalCount: 0,
        },
      },
    },
    {
      cursor: 'WyI5ZDE2MmRlNi1jZmJmLTQxNTYtYTc5MC1lMzk4NTRkY2Q0ZWIiXQ==',
      node: {
        id: '9d162de6-cfbf-4156-a790-e39854dcd4eb',
        name: 'Claap',
        people: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
          totalCount: 0,
        },
      },
    },
    {
      cursor: 'WyJhNjc0ZmE2Yy0xNDU1LTRjNTctYWZhZi1kZDVkYzA4NjM2MWQiXQ==',
      node: {
        id: 'a674fa6c-1455-4c57-afaf-dd5dc086361d',
        name: 'Algolia',
        people: {
          edges: [
            {
              cursor:
                'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGYiXQ==',
              node: {
                id: '240da2ec-2d40-4e49-8df4-9c6a049191df',
                name: {
                  firstName: 'Lorie',
                  lastName: 'Vladim',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
          ],
          pageInfo: {
            endCursor:
              'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGYiXQ==',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGYiXQ==',
          },
          totalCount: 1,
        },
      },
    },
    {
      cursor: 'WyJhN2JjNjhkNS1mNzllLTQwZGQtYmQwNi1jMzZlNmFiYjQ2NzgiXQ==',
      node: {
        id: 'a7bc68d5-f79e-40dd-bd06-c36e6abb4678',
        name: 'Samsung',
        people: {
          edges: [
            {
              cursor:
                'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGUiXQ==',
              node: {
                id: '240da2ec-2d40-4e49-8df4-9c6a049191de',
                name: {
                  firstName: 'Louis',
                  lastName: 'Duss',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
          ],
          pageInfo: {
            endCursor:
              'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGUiXQ==',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGUiXQ==',
          },
          totalCount: 1,
        },
      },
    },
    {
      cursor: 'WyJhYWZmY2ZiZC1mODZiLTQxOWYtYjc5NC0wMjMxOWFiZTg2MzciXQ==',
      node: {
        id: 'aaffcfbd-f86b-419f-b794-02319abe8637',
        name: 'Hasura',
        people: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
          totalCount: 0,
        },
      },
    },
    {
      cursor: 'WyJmMzNkYzI0Mi01NTE4LTQ1NTMtOTQzMy00MmQ4ZWI4MjgzNGIiXQ==',
      node: {
        id: 'f33dc242-5518-4553-9433-42d8eb82834b',
        name: 'Wework',
        people: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
          },
          totalCount: 0,
        },
      },
    },
    {
      cursor: 'WyJmZTI1NmIzOS0zZWMzLTRmZTMtODk5Ny1iNzZhYTBiZmE0MDgiXQ==',
      node: {
        id: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
        name: 'Linkedin',
        people: {
          edges: [
            {
              cursor:
                'WyIwYWEwMGJlYi1hYzczLTQ3OTctODI0ZS04N2ExZjVhZWE5ZTAiXQ==',
              node: {
                id: '0aa00beb-ac73-4797-824e-87a1f5aea9e0',
                name: {
                  firstName: 'Sylvie',
                  lastName: 'Palmer',
                },
                favorites: {
                  edges: [
                    {
                      cursor:
                        'WyIzN2I5NzE0MC0yNmI5LTQ5OGMtODM3Yi00ZjNkZTQ5OWFkODMiXQ==',
                      node: {
                        id: '37b97140-26b9-498c-837b-4f3de499ad83',
                        personId: '0aa00beb-ac73-4797-824e-87a1f5aea9e0',
                        companyId: null,
                        position: 1,
                      },
                    },
                  ],
                  pageInfo: {
                    endCursor:
                      'WyIzN2I5NzE0MC0yNmI5LTQ5OGMtODM3Yi00ZjNkZTQ5OWFkODMiXQ==',
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor:
                      'WyIzN2I5NzE0MC0yNmI5LTQ5OGMtODM3Yi00ZjNkZTQ5OWFkODMiXQ==',
                  },
                  totalCount: 1,
                },
              },
            },
            {
              cursor:
                'WyI4NjA4MzE0MS0xYzBlLTQ5NGMtYTFiNi04NWIxYzZmZWZhYTUiXQ==',
              node: {
                id: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
                name: {
                  firstName: 'Christoph',
                  lastName: 'Callisto',
                },
                favorites: {
                  edges: [],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                  },
                  totalCount: 0,
                },
              },
            },
          ],
          pageInfo: {
            endCursor:
              'WyI4NjA4MzE0MS0xYzBlLTQ5NGMtYTFiNi04NWIxYzZmZWZhYTUiXQ==',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'WyIwYWEwMGJlYi1hYzczLTQ3OTctODI0ZS04N2ExZjVhZWE5ZTAiXQ==',
          },
          totalCount: 2,
        },
      },
    },
  ],
  totalCount: 13,
};

export const peopleWithTheirUniqueCompanies: ObjectRecordConnection<
  Pick<Person, 'id'> & { company: Pick<Company, 'id' | 'name'> }
> = {
  pageInfo: {
    endCursor: 'WyJlZWVhY2FjZi1lZWUxLTQ2OTAtYWQyYy04NjE5ZTViNTZhMmUiXQ==',
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'WyIwYWEwMGJlYi1hYzczLTQ3OTctODI0ZS04N2ExZjVhZWE5ZTAiXQ==',
  },
  totalCount: 15,
  edges: [
    {
      cursor: 'WyIwYWEwMGJlYi1hYzczLTQ3OTctODI0ZS04N2ExZjVhZWE5ZTAiXQ==',
      node: {
        id: '0aa00beb-ac73-4797-824e-87a1f5aea9e0',
        company: {
          id: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
          name: 'Linkedin',
        },
      },
    },
    {
      cursor: 'WyIxZDE1MTg1Mi00OTBmLTQ0NjYtODM5MS03MzNjZmQ2NmEwYzgiXQ==',
      node: {
        id: '1d151852-490f-4466-8391-733cfd66a0c8',
        company: {
          id: '460b6fb1-ed89-413a-b31a-962986e67bb4',
          name: 'Microsoft',
        },
      },
    },
    {
      cursor: 'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkwZGYiXQ==',
      node: {
        id: '240da2ec-2d40-4e49-8df4-9c6a049190df',
        company: {
          id: '0d940997-c21e-4ec2-873b-de4264d89025',
          name: 'Google',
        },
      },
    },
    {
      cursor: 'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkwZWYiXQ==',
      node: {
        id: '240da2ec-2d40-4e49-8df4-9c6a049190ef',
        company: {
          id: '0d940997-c21e-4ec2-873b-de4264d89025',
          name: 'Google',
        },
      },
    },
    {
      cursor: 'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGUiXQ==',
      node: {
        id: '240da2ec-2d40-4e49-8df4-9c6a049191de',
        company: {
          id: 'a7bc68d5-f79e-40dd-bd06-c36e6abb4678',
          name: 'Samsung',
        },
      },
    },
    {
      cursor: 'WyIyNDBkYTJlYy0yZDQwLTRlNDktOGRmNC05YzZhMDQ5MTkxZGYiXQ==',
      node: {
        id: '240da2ec-2d40-4e49-8df4-9c6a049191df',
        company: {
          id: 'a674fa6c-1455-4c57-afaf-dd5dc086361d',
          name: 'Algolia',
        },
      },
    },
    {
      cursor: 'WyI1Njk1NTQyMi01ZDU0LTQxYjctYmEzNi1mMGQyMGUxNDE3YWUiXQ==',
      node: {
        id: '56955422-5d54-41b7-ba36-f0d20e1417ae',
        company: {
          id: '0d940997-c21e-4ec2-873b-de4264d89025',
          name: 'Google',
        },
      },
    },
    {
      cursor: 'WyI3NTUwMzVkYi02MjNkLTQxZmUtOTJlNy1kZDQ1YjdjNTY4ZTEiXQ==',
      node: {
        id: '755035db-623d-41fe-92e7-dd45b7c568e1',
        company: {
          id: '0d940997-c21e-4ec2-873b-de4264d89025',
          name: 'Google',
        },
      },
    },
    {
      cursor: 'WyI4NjA4MzE0MS0xYzBlLTQ5NGMtYTFiNi04NWIxYzZmZWZhYTUiXQ==',
      node: {
        id: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        company: {
          id: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
          name: 'Linkedin',
        },
      },
    },
    {
      cursor: 'WyI5M2M3MmQyZS1mNTE3LTQyZmQtODBhZS0xNDE3M2IzYjcwYWUiXQ==',
      node: {
        id: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
        company: {
          id: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
          name: 'Facebook',
        },
      },
    },
    {
      cursor: 'WyI5ODQwNmUyNi04MGYxLTRkZmYtYjU3MC1hNzQ5NDI1MjhkZTMiXQ==',
      node: {
        id: '98406e26-80f1-4dff-b570-a74942528de3',
        company: {
          id: '460b6fb1-ed89-413a-b31a-962986e67bb4',
          name: 'Microsoft',
        },
      },
    },
    {
      cursor: 'WyI5YjMyNGE4OC02Nzg0LTQ0NDktYWZkZi1kYzYyY2I4NzAyZjIiXQ==',
      node: {
        id: '9b324a88-6784-4449-afdf-dc62cb8702f2',
        company: {
          id: '460b6fb1-ed89-413a-b31a-962986e67bb4',
          name: 'Microsoft',
        },
      },
    },
    {
      cursor: 'WyJhMmU3OGE1Zi0zMzhiLTQ2ZGYtODgxMS1mYTA4YzdkMTlkMzUiXQ==',
      node: {
        id: 'a2e78a5f-338b-46df-8811-fa08c7d19d35',
        company: {
          id: '0d940997-c21e-4ec2-873b-de4264d89025',
          name: 'Google',
        },
      },
    },
    {
      cursor: 'WyJjYTFmNWJmMy02NGFkLTRiMGUtYmJmZC1lOWZkNzk1YjcwMTYiXQ==',
      node: {
        id: 'ca1f5bf3-64ad-4b0e-bbfd-e9fd795b7016',
        company: {
          id: '0d940997-c21e-4ec2-873b-de4264d89025',
          name: 'Google',
        },
      },
    },
    {
      cursor: 'WyJlZWVhY2FjZi1lZWUxLTQ2OTAtYWQyYy04NjE5ZTViNTZhMmUiXQ==',
      node: {
        id: 'eeeacacf-eee1-4690-ad2c-8619e5b56a2e',
        company: {
          id: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
          name: 'Facebook',
        },
      },
    },
  ],
};
