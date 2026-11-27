import { useOnApplicationSdkClientChecksumsUpdated } from '@/front-components/hooks/useOnApplicationSdkClientChecksumsUpdated';
import { type FrontComponentFieldsNeededToStartLoading } from '@/front-components/types/FrontComponentFieldsNeededToStartLoading';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { GetApplicationSdkClientChecksumsDocument } from '~/generated-metadata/graphql';

export const useFrontComponentSourceUrls = ({
  id: frontComponentId,
  applicationId,
  builtComponentChecksum,
  usesSdkClient,
  frontComponentSharedDependenciesChecksum,
}: FrontComponentFieldsNeededToStartLoading) => {
  const { data: sdkClientChecksumsData, loading: sdkClientChecksumsLoading } =
    useQuery(GetApplicationSdkClientChecksumsDocument, {
      variables: { applicationId },
      skip: !usesSdkClient,
    });

  useOnApplicationSdkClientChecksumsUpdated({
    applicationId,
    skip: !usesSdkClient,
  });

  const sdkClientChecksums =
    sdkClientChecksumsData?.applicationSdkClientChecksums;

  const sdkClientUrls = useMemo(
    () => getSdkClientUrls(applicationId, sdkClientChecksums),
    [applicationId, sdkClientChecksums],
  );

  const sharedDependenciesUrl = getFingerprintedRestUrl({
    resource: 'front-component-shared-dependencies',
    id: applicationId,
    checksum: frontComponentSharedDependenciesChecksum ?? undefined,
  });

  const componentUrl = getFingerprintedRestUrl({
    resource: 'front-components',
    id: frontComponentId,
    checksum: builtComponentChecksum,
  });

  return {
    componentUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    hasSharedDependencies: isDefined(frontComponentSharedDependenciesChecksum),
    isSdkClientReady: !usesSdkClient || !sdkClientChecksumsLoading,
  };
};
