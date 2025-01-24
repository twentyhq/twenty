import { GetPublicWorkspaceDataBySubdomainQuery } from '~/generated/graphql';

export const mockedPublicWorkspaceDataBySubdomain: GetPublicWorkspaceDataBySubdomainQuery['getPublicWorkspaceDataBySubdomain'] =
  {
    __typename: 'PublicWorkspaceDataOutput',
    id: '9870323e-22c3-4d14-9b7f-5bdc84f7d6ee',
    logo: 'workspace-logo/original/c88deb49-7636-4560-918d-08c3265ffb20.49?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3Jrc3BhY2VJZCI6Ijk4NzAzMjNlLTIyYzMtNGQxNC05YjdmLTViZGM4NGY3ZDZlZSIsImlhdCI6MTczNjU0MDU0MywiZXhwIjoxNzM2NjI2OTQzfQ.C8cnHu09VGseRbQAMM4nhiO6z4TLG03ntFTvxm53-xg',
    displayName: 'Twenty Eng',
    subdomain: 'twenty-eng',
    authProviders: {
      __typename: 'AuthProviders',
      sso: [],
      google: true,
      magicLink: false,
      password: true,
      microsoft: false,
    },
  };
