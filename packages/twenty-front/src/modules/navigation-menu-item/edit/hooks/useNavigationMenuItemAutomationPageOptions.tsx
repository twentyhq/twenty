import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { getObjectNavigationMenuItemOption } from '@/navigation-menu-item/edit/utils/getObjectNavigationMenuItemOption';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type UseNavigationMenuItemAutomationPageOptionsParams = {
  automationObjectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataIdsAlreadyAdded: Set<string>;
  currentItems: NavigationMenuItem[];
  hasWorkflowsPermission: boolean;
  hasAiPermission: boolean;
  addItem: (input: NewNavigationMenuItemInput) => void;
};

export const useNavigationMenuItemAutomationPageOptions = ({
  automationObjectMetadataItems,
  objectMetadataIdsAlreadyAdded,
  currentItems,
  hasWorkflowsPermission,
  hasAiPermission,
  addItem,
}: UseNavigationMenuItemAutomationPageOptionsParams): NavigationMenuItemOption[] => {
  const { t } = useLingui();
  const theme = useTheme();

  const isAgentsPageInSidebar = currentItems.some(
    (item) =>
      item.type === NavigationMenuItemType.AGENT && !isDefined(item.agentId),
  );

  return [
    ...(hasWorkflowsPermission
      ? automationObjectMetadataItems.map((objectMetadataItem) =>
          getObjectNavigationMenuItemOption({
            objectMetadataItem,
            isAlreadyInSidebar: objectMetadataIdsAlreadyAdded.has(
              objectMetadataItem.id,
            ),
            addItem,
          }),
        )
      : []),
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
};
