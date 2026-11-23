import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { matchPath, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { FindOneAgentDocument } from '~/generated-metadata/graphql';

export const useCurrentCoreAgent = () => {
  const location = useLocation();
  const agentId = matchPath(AppPath.AgentShowPage, location.pathname)?.params
    .agentId;

  const { data } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId ?? '' },
    skip: !isNonEmptyString(agentId),
  });

  return data?.findOneAgent;
};
