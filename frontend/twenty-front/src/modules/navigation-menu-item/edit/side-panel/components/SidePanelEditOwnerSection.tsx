import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconApps } from 'twenty-ui/display';

import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useQuery } from '@apollo/client/react';
import { FindOneApplicationDocument } from '~/generated-metadata/graphql';

type SidePanelEditOwnerSectionProps = {
  applicationId?: string | null;
};

export const SidePanelEditOwnerSection = ({
  applicationId: applicationIdProp,
}: SidePanelEditOwnerSectionProps) => {
  const { t } = useLingui();

  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { currentDraft } = useDraftNavigationMenuItems();

  const applicationIdFromDraft =
    isDefined(selectedItem) && isDefined(currentDraft)
      ? currentDraft.find((item) => item.id === selectedItem.id)?.applicationId
      : undefined;

  const applicationId = applicationIdProp ?? applicationIdFromDraft;

  const { data } = useQuery(FindOneApplicationDocument, {
    variables: { id: applicationId ?? '' },
    skip: !isDefined(applicationId),
  });

  const applicationName = data?.findOneApplication?.name;

  if (!isDefined(applicationName)) {
    return null;
  }

  return (
    <SidePanelGroup heading={t`Owner`}>
      <SelectableListItem itemId="owner-app" onEnter={() => {}}>
        <CommandMenuItem
          Icon={IconApps}
          label={applicationName}
          id="owner-app"
          disabled
        />
      </SelectableListItem>
    </SidePanelGroup>
  );
};
