import { isDefined } from 'src/utils/is-defined';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const createFathomApplicationCoreApiClient =
  async (): Promise<CoreApiClient> => {
    const metadataApiClient = new MetadataApiClient();
    const applicationsResult = await metadataApiClient.query({
      findManyApplications: {
        id: true,
        universalIdentifier: true,
      },
    });
    const fathomApplication = applicationsResult.findManyApplications.find(
      (application) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    if (!isDefined(fathomApplication)) {
      throw new Error('Expected the Fathom application to be installed');
    }

    const applicationTokenResult = await metadataApiClient.mutation({
      generateApplicationToken: {
        __args: { applicationId: fathomApplication.id },
        applicationAccessToken: { token: true },
      },
    });

    return new CoreApiClient({
      headers: {
        Authorization: `Bearer ${applicationTokenResult.generateApplicationToken.applicationAccessToken.token}`,
      },
    });
  };
