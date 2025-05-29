export const mockedConnectedAccounts = [
  {
    id: '8619ace5-1814-4e56-8439-553eab32a5cc',
    handle: 'tim@twenty.com',
    provider: 'gmail',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    accountOwnerId: '56561b12-cbad-49db-a6bc-00e6b153ec80',
  },
];

export const getMockedConnectedAccount = () => {
  return {
    edges: [
      {
        node: {
          ...mockedConnectedAccounts[0],
        },
        cursor: null,
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
