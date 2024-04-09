import { RemoteTableStatus } from '~/generated-metadata/graphql';

export const mockedRemoteObjectIntegrations = [
  {
    id: '5b717911-dc75-4876-bf33-dfdc994c88cd',
    key: 'postgresql',
    connections: [
      {
        id: '67cbfd35-8dd4-4591-b9d4-c1906281a5da',
        name: 'Twenty_postgres',
        tables: [
          { name: 'Invoices', status: RemoteTableStatus.NotSynced },
          { name: 'Quotes', status: RemoteTableStatus.Synced },
          { name: 'Customers', status: RemoteTableStatus.NotSynced },
          { name: 'Subscriptions', status: RemoteTableStatus.Synced },
          { name: 'Payments', status: RemoteTableStatus.NotSynced },
        ],
      },
      {
        id: '3740cd85-7a1e-45b5-8b0d-47e1921d01f3',
        name: 'Image_postgres',
        tables: [],
      },
    ],
  },
];
