import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconEye, IconLock, IconPencil } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { getRecordSharingGeneralAccess } from '@/object-record/record-sharing/utils/getRecordSharingGeneralAccess';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SidePanelShareRecordGeneralAccessItemProps = {
  generalAccessLevel: RecordShareAccessLevel | null | undefined;
  defaultGeneralAccessLevel: RecordShareAccessLevel | null | undefined;
  hasManagedGeneralAccess: boolean;
  objectLabelPlural: string;
  isSaving: boolean;
  setGeneralAccess: ReturnType<typeof useRecordSharing>['setGeneralAccess'];
};

export const SidePanelShareRecordGeneralAccessItem = ({
  generalAccessLevel,
  defaultGeneralAccessLevel,
  hasManagedGeneralAccess,
  objectLabelPlural,
  isSaving,
  setGeneralAccess,
}: SidePanelShareRecordGeneralAccessItemProps) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const workspaceName = currentWorkspace?.displayName ?? '';
  const isRestricted =
    !isDefined(generalAccessLevel) ||
    generalAccessLevel === RecordShareAccessLevel.NONE;
  const { hasGeneralAccess, label: generalAccessLabel } =
    getRecordSharingGeneralAccess({
      sharing: { generalAccessLevel, hasManagedGeneralAccess },
      objectLabelPlural,
    });
  const withDefaultMarker = ({
    label,
    accessLevel,
  }: {
    label: string;
    accessLevel: RecordShareAccessLevel;
  }) =>
    accessLevel === defaultGeneralAccessLevel ? t`${label} (default)` : label;

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
      description={
        isRestricted
          ? undefined
          : getRecordShareAccessLevelLabel(generalAccessLevel)
      }
      disabled={isSaving}
      width={GenericDropdownContentWidth.Medium}
    >
      <Dropdown.Section>
        <Dropdown.OptionItem
          startIcon={<IconLock />}
          selected={!hasGeneralAccess}
          disabled={isRestricted || isSaving}
          onSelect={() => {
            void setGeneralAccess(RecordShareAccessLevel.NONE);
          }}
        >
          {withDefaultMarker({
            label: t`Restricted`,
            accessLevel: RecordShareAccessLevel.NONE,
          })}
        </Dropdown.OptionItem>
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section label={t(generalAccessLabel)}>
        {RECORD_SHARE_ACCESS_LEVEL_OPTIONS.filter(
          // Full access lets its holder manage sharing, so it is only granted by name
          (option) => option.value !== RecordShareAccessLevel.FULL,
        ).map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            startIcon={
              option.value === RecordShareAccessLevel.READ ? (
                <IconEye />
              ) : (
                <IconPencil />
              )
            }
            selected={generalAccessLevel === option.value}
            disabled={generalAccessLevel === option.value || isSaving}
            onSelect={() => {
              void setGeneralAccess(option.value);
            }}
          >
            {withDefaultMarker({
              label: t(option.label),
              accessLevel: option.value,
            })}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </SidePanelShareRecordDropdownItem>
  );
};
