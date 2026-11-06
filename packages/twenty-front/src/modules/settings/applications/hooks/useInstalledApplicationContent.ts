import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';

import { FindOneApplicationContentDocument } from '~/generated-metadata/graphql';

export const useInstalledApplicationContent = ({
  applicationId,
  universalIdentifier,
  shouldSkip = false,
}: {
  applicationId?: string;
  universalIdentifier?: string;
  shouldSkip?: boolean;
}) => {
  const { data, loading, error } = useQuery(FindOneApplicationContentDocument, {
    variables: { id: applicationId, universalIdentifier },
    skip:
      shouldSkip ||
      (!isNonEmptyString(applicationId) &&
        !isNonEmptyString(universalIdentifier)),
  });

  return {
    application: data?.findOneApplication,
    content: data?.findOneApplication?.content,
    isLoading: loading,
    error,
  };
};
