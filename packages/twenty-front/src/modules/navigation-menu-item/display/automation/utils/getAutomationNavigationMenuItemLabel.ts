import { t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getAutomationNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'type' | 'agentId' | 'name'>,
): string =>
  item.type === NavigationMenuItemType.AGENT && !isDefined(item.agentId)
    ? t`Agents`
    : (item.name ?? '');
