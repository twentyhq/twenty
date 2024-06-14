export const mockedRemoteServers = [
  {
    __typename: 'RemoteServer',
    id: '67cbfd35-8dd4-4591-b9d4-c1906281a5da',
    createdAt: '2024-04-30T13:41:25.584Z',
    foreignDataWrapperId: 'b306b641-2142-4b4e-8fba-976afbc3b2bc',
    foreignDataWrapperOptions: {
      host: 'localhost',
      port: 5432,
      dbname: 'dbname_test',
    },
    foreignDataWrapperType: 'postgres_fdw',
    userMappingOptions: {
      __typename: 'UserMappingOptionsDTO',
      user: 'twenty',
    },
    updatedAt: '2024-04-30T13:41:25.858Z',
    schema: 'public',
    label: 'postgres DB',
  },
  {
    __typename: 'RemoteServer',
    id: 'ddc3b641-2142-4b4e-8fba-976afbc3b2bc',
    createdAt: '2024-04-30T13:41:25.584Z',
    foreignDataWrapperId: 'dqfdsqf-2142-4b4e-8fba-976afbc3b2bc',
    foreignDataWrapperOptions: {
      api_key: 'sk_test_51',
    },
    foreignDataWrapperType: 'stripe_fdw',
    updatedAt: '2024-04-30T13:41:25.858Z',
    label: 'stripe DB',
  },
];
