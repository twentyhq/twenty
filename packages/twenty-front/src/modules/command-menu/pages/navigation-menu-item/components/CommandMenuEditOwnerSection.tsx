import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconApps } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useNavigationMenuItemEditFolderData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditFolderData';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';

type CommandMenuEditOwnerSectionProps = {
  applicationId?: string | null;
};

export const CommandMenuEditOwnerSection = ({
  applicationId: applicationIdProp,
}: CommandMenuEditOwnerSectionProps) => {
  const { t } = useLingui();

  const { selectedItem } = useSelectedNavigationMenuItemEditData();
  const { currentDraft } = useNavigationMenuItemEditFolderData();

  const applicationIdFromDraft =
    selectedItem && currentDraft
      ? currentDraft.find((item) => item.id === selectedItem.id)?.applicationId
      : undefined;

  const applicationId = applicationIdProp ?? applicationIdFromDraft;

  const { data } = useFindOneApplicationQuery({
    variables: { id: applicationId ?? '' },
    skip: !isDefined(applicationId),
  });

  const applicationName = data?.findOneApplication?.name;

  if (!isDefined(applicationName)) {
    return null;
  }

  return (
    <CommandGroup heading={t`Owner`}>
      <SelectableListItem itemId="owner-app" onEnter={() => {}}>
        <CommandMenuItem
          Icon={IconApps}
          label={applicationName}
          id="owner-app"
          disabled
        />
      </SelectableListItem>
    </CommandGroup>
  );
};
