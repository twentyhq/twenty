export const mockedRemoteObjectIntegrations = [
  {
    id: '5b717911-dc75-4876-bf33-dfdc994c88cd',
    key: 'postgresql',
    connections: [
      {
        id: '67cbfd35-8dd4-4591-b9d4-c1906281a5da',
        key: 'twenty_postgres',
        name: 'Twenty_postgres',
        tables: [
          { id: 'invoices', name: 'Invoices' },
          { id: 'quotes', name: 'Quotes', isSynced: true },
          { id: 'customers', name: 'Customers', isSynced: false },
          { id: 'subscriptions', name: 'Subscriptions', isSynced: true },
          { id: 'payments', name: 'Payments' },
        ],
      },
      {
        id: '3740cd85-7a1e-45b5-8b0d-47e1921d01f3',
        key: 'image_postgres',
        name: 'Image_postgres',
        tables: [],
      },
    ],
  },
];
