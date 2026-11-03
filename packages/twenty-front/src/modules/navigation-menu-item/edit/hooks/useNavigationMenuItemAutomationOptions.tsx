import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useDebounce } from 'use-debounce';
import { PermissionFlagType } from 'twenty-shared/constants';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

import { AUTOMATION_OBJECT_NAMES_SINGULAR } from '@/navigation-menu-item/common/constants/AutomationObjectNamesSingular';
import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  CoreWorkflowFilterFieldKey,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  GetCoreWorkflowsDocument,
} from '~/generated/graphql';
import {
  FindManyAgentsDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

const WORKFLOW_SEARCH_DEBOUNCE_DELAY = 300;
const WORKFLOW_OPTIONS_LIMIT = 50;

const compareAlreadyInSidebarLast = (
  firstOption: NavigationMenuItemOption,
  secondOption: NavigationMenuItemOption,
) =>
  Number(firstOption.isAlreadyInSidebar) -
  Number(secondOption.isAlreadyInSidebar);

type UseNavigationMenuItemAutomationOptionsParams = {
  search: string;
  skip: boolean;
  currentItems: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataIdsWithIndexView: Set<string>;
  objectMetadataIdsAlreadyAdded: Set<string>;
  addItem: (input: NewNavigationMenuItemInput) => void;
};

export const useNavigationMenuItemAutomationOptions = ({
  search,
  skip,
  currentItems,
  objectMetadataItems,
  objectMetadataIdsWithIndexView,
  objectMetadataIdsAlreadyAdded,
  addItem,
}: UseNavigationMenuItemAutomationOptionsParams) => {
  const { t } = useLingui();
  const theme = useTheme();
  const apolloCoreClient = useApolloCoreClient();
  const hasWorkflowsPermission = useHasPermissionFlag(
    PermissionFlagType.WORKFLOWS,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const [workflowSearch] = useDebounce(
    search.trim(),
    WORKFLOW_SEARCH_DEBOUNCE_DELAY,
  );

  const { data: workflowsData, loading: workflowsLoading } = useQuery(
    GetCoreWorkflowsDocument,
    {
      client: apolloCoreClient,
      skip: skip || !hasWorkflowsPermission,
      variables: {
        first: WORKFLOW_OPTIONS_LIMIT,
        orderBy: CoreWorkflowOrderByField.NAME,
        orderByDirection: CoreWorkflowOrderByDirection.ASC,
        filter: {
          logicalOperator: CoreWorkflowFilterLogicalOperator.AND,
          rules: [
            {
              fieldKey: CoreWorkflowFilterFieldKey.IS_SYSTEM,
              operand: CoreWorkflowFilterOperand.IS,
              value: 'false',
            },
            ...(isNonEmptyString(workflowSearch)
              ? [
                  {
                    fieldKey: CoreWorkflowFilterFieldKey.NAME,
                    operand: CoreWorkflowFilterOperand.CONTAINS,
                    value: workflowSearch,
                  },
                ]
              : []),
          ],
        },
      },
    },
  );

  const { data: agentsData, loading: agentsLoading } = useQuery(
    FindManyAgentsDocument,
    { skip: skip || !hasAiPermission },
  );

  const automationObjectMetadataItems = hasWorkflowsPermission
    ? AUTOMATION_OBJECT_NAMES_SINGULAR.flatMap((nameSingular) =>
        objectMetadataItems.filter(
          (objectMetadataItem) =>
            objectMetadataItem.isActive &&
            objectMetadataItem.nameSingular === nameSingular &&
            objectMetadataIdsWithIndexView.has(objectMetadataItem.id),
        ),
      )
    : [];

  const isAgentsPageInSidebar = currentItems.some(
    (item) =>
      item.type === NavigationMenuItemType.AGENT && !isDefined(item.agentId),
  );

  const automationPageItems: NavigationMenuItemOption[] = [
    ...automationObjectMetadataItems.map((objectMetadataItem) => ({
      id: objectMetadataItem.id,
      label: objectMetadataItem.labelPlural,
      icon: <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />,
      isAlreadyInSidebar: objectMetadataIdsAlreadyAdded.has(
        objectMetadataItem.id,
      ),
      isDisabled: objectMetadataIdsAlreadyAdded.has(objectMetadataItem.id),
      onClick: () =>
        addItem({
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: objectMetadataItem.id,
          color: getObjectColorWithFallback(objectMetadataItem),
        }),
    })),
    ...(hasAiPermission
      ? [
          {
            id: 'agents',
            label: t`Agents`,
            icon: <CoreAgentIcon size={theme.icon.size.md} />,
            isAlreadyInSidebar: isAgentsPageInSidebar,
            isDisabled: isAgentsPageInSidebar,
            onClick: () => addItem({ type: NavigationMenuItemType.AGENT }),
          },
        ]
      : []),
  ];

  const workflowItems: NavigationMenuItemOption[] = (
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

  const agentItems: NavigationMenuItemOption[] = (
    agentsData?.findManyAgents ?? []
  )
    .filter((agent) => !agent.isSystem)
    .sort((firstAgent, secondAgent) =>
      firstAgent.label.localeCompare(secondAgent.label),
    )
    .map((agent) => {
      const isAlreadyInSidebar = currentItems.some(
        (item) => item.agentId === agent.id,
      );

      return {
        id: agent.id,
        label: agent.label,
        icon: (
          <CoreAgentIcon
            agentId={agent.id}
            avatarColor={agent.avatarColor}
            avatarShape={agent.avatarShape}
            size={theme.icon.size.md}
          />
        ),
        isAlreadyInSidebar,
        isDisabled: isAlreadyInSidebar,
        onClick: () =>
          addItem({
            type: NavigationMenuItemType.AGENT,
            agentId: agent.id,
            name: agent.label,
          }),
      };
    });

  return {
    hasAutomationAccess: hasWorkflowsPermission || hasAiPermission,
    automationItemGroups: [
      {
        label: '',
        items: automationPageItems.toSorted(compareAlreadyInSidebarLast),
      },
      {
        label: t`Workflows`,
        items: workflowItems.toSorted(compareAlreadyInSidebarLast),
      },
      {
        label: t`Agents`,
        items: agentItems.toSorted(compareAlreadyInSidebarLast),
      },
    ],
    automationLoading: workflowsLoading || agentsLoading,
  };
};
