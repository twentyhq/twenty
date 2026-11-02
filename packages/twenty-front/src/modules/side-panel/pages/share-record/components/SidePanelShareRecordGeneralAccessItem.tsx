import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconLock, IconPencil } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordSharingGeneralAccess } from '@/object-record/record-sharing/utils/getRecordSharingGeneralAccess';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SidePanelShareRecordGeneralAccessItemProps = {
  isPrivate: boolean;
  hasManagedGeneralAccess: boolean;
  objectLabelPlural: string;
  isSaving: boolean;
  setPrivate: ReturnType<typeof useRecordSharing>['setPrivate'];
};

export const SidePanelShareRecordGeneralAccessItem = ({
  isPrivate,
  hasManagedGeneralAccess,
  objectLabelPlural,
  isSaving,
  setPrivate,
}: SidePanelShareRecordGeneralAccessItemProps) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const workspaceName = currentWorkspace?.displayName ?? '';
  const { hasGeneralAccess, label: generalAccessLabel } =
    getRecordSharingGeneralAccess({
      sharing: { isShareable: true, isPrivate, hasManagedGeneralAccess },
      objectLabelPlural,
    });

  return (
    <SidePanelShareRecordDropdownItem
      label={hasGeneralAccess ? t(generalAccessLabel) : t`Restricted`}
      Icon={IconLock}
      LeftComponent={
        hasGeneralAccess ? (
          <ListItemIconContainer>
            <Avatar
              name={workspaceName}
              colorSeed={getWorkspaceAvatarColorSeed(workspaceName)}
              src={getAbsoluteImageUrl(
                currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
              )}
              shape="square"
            />
          </ListItemIconContainer>
        ) : undefined
      }
      description={isPrivate ? undefined : t`As their role allows`}
      disabled={isSaving}
      width={GenericDropdownContentWidth.Medium}
    >
      <Dropdown.Section>
        <Dropdown.OptionItem
          startIcon={<IconLock />}
          selected={isPrivate}
          disabled={isPrivate || isSaving}
          onSelect={() => {
            void setPrivate(true);
          }}
        >
          {t`Restricted`}
        </Dropdown.OptionItem>
        <Dropdown.OptionItem
          startIcon={<IconPencil />}
          selected={!isPrivate}
          disabled={!isPrivate || isSaving}
          onSelect={() => {
            void setPrivate(false);
          }}
        >
          {t(generalAccessLabel)}
        </Dropdown.OptionItem>
      </Dropdown.Section>
    </SidePanelShareRecordDropdownItem>
  );
};
