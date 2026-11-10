import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useDebounce } from 'use-debounce';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { buildCoreWorkflowOptionsFilter } from '@/navigation-menu-item/edit/utils/buildCoreWorkflowOptionsFilter';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  GetCoreWorkflowsDocument,
} from '~/generated/graphql';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const WORKFLOW_SEARCH_DEBOUNCE_DELAY = 300;
const WORKFLOW_OPTIONS_LIMIT = 50;

type UseNavigationMenuItemWorkflowOptionsParams = {
  search: string;
  skip: boolean;
  currentItems: NavigationMenuItem[];
  addItem: (input: NewNavigationMenuItemInput) => void;
};

export const useNavigationMenuItemWorkflowOptions = ({
  search,
  skip,
  currentItems,
  addItem,
}: UseNavigationMenuItemWorkflowOptionsParams) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();

  const [workflowSearch] = useDebounce(
    search.trim(),
    WORKFLOW_SEARCH_DEBOUNCE_DELAY,
  );

  const { data: workflowsData, loading: workflowOptionsLoading } = useQuery(
    GetCoreWorkflowsDocument,
    {
      client: apolloCoreClient,
      skip,
      variables: {
        first: WORKFLOW_OPTIONS_LIMIT,
        orderBy: CoreWorkflowOrderByField.NAME,
        orderByDirection: CoreWorkflowOrderByDirection.ASC,
        filter: buildCoreWorkflowOptionsFilter(workflowSearch),
      },
    },
  );

  const workflowOptions: NavigationMenuItemOption[] = (
    workflowsData?.coreWorkflows.edges ?? []
  ).map(({ node: workflow }) => {
    const isAlreadyInSidebar = currentItems.some(
      (item) => item.workflowId === workflow.id,
    );

    return {
      id: workflow.id,
      label: isNonEmptyString(workflow.name) ? workflow.name : t`Untitled`,
      icon: (
        <Avatar
          size="md"
          shape="circle"
          name={workflow.name ?? undefined}
          colorSeed={workflow.id}
        />
      ),
      isAlreadyInSidebar,
      isDisabled: isAlreadyInSidebar,
      onClick: () =>
        addItem({
          type: NavigationMenuItemType.WORKFLOW,
          workflowId: workflow.id,
          name: workflow.name,
        }),
    };
  });

  return { workflowOptions, workflowOptionsLoading };
};
