import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';

import { coreAgentSidePanelAgentIdComponentState } from '@/object-core/agents/states/coreAgentSidePanelAgentIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';

export const useCoreAgentSidePanelAgent = () => {
  const coreAgentSidePanelAgentId = useAtomComponentStateValue(
    coreAgentSidePanelAgentIdComponentState,
  );

  const { data, loading } = useQuery(FindOneAgentDocument, {
    variables: { id: coreAgentSidePanelAgentId ?? '' },
    skip: !isNonEmptyString(coreAgentSidePanelAgentId),
  });

  return { agent: data?.findOneAgent, loading };
};
