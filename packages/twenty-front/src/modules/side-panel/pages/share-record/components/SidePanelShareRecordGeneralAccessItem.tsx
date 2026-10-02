import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconLock, IconUsers } from 'twenty-ui/icon';

import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

type SidePanelShareRecordGeneralAccessItemProps = {
  itemId: string;
  generalAccessLevel: RecordShareAccessLevel | null | undefined;
  defaultGeneralAccessLevel: RecordShareAccessLevel | null | undefined;
  hasManagedGeneralAccess: boolean;
  objectLabelPlural: string;
  saving: boolean;
  setGeneralAccess: ReturnType<typeof useRecordSharing>['setGeneralAccess'];
};

export const SidePanelShareRecordGeneralAccessItem = ({
  itemId,
  generalAccessLevel,
  defaultGeneralAccessLevel,
  hasManagedGeneralAccess,
  objectLabelPlural,
  saving,
  setGeneralAccess,
}: SidePanelShareRecordGeneralAccessItemProps) => {
  const { t } = useLingui();
  const isRestricted =
    !isDefined(generalAccessLevel) ||
    generalAccessLevel === RecordShareAccessLevel.NONE;
  const hasWorkspaceAccess = !isRestricted || hasManagedGeneralAccess;
  const withDefaultMarker = (
    label: string,
    accessLevel: RecordShareAccessLevel,
  ) =>
    accessLevel === defaultGeneralAccessLevel ? t`${label} (default)` : label;

  return (
    <SidePanelShareRecordDropdownItem
      itemId={itemId}
      label={
        hasWorkspaceAccess
          ? t`Everyone with access to ${objectLabelPlural}`
          : t`Restricted`
      }
      Icon={hasWorkspaceAccess ? IconUsers : IconLock}
      description={
        isRestricted
          ? undefined
          : getRecordShareAccessLevelLabel(generalAccessLevel)
      }
      disabled={saving}
      width={280}
    >
      <Dropdown.Section>
        <Dropdown.OptionItem
          selected={!hasWorkspaceAccess}
          disabled={isRestricted || saving}
          onSelect={() => {
            void setGeneralAccess(RecordShareAccessLevel.NONE);
          }}
        >
          {withDefaultMarker(t`Restricted`, RecordShareAccessLevel.NONE)}
        </Dropdown.OptionItem>
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section label={t`Everyone with access to ${objectLabelPlural}`}>
        {RECORD_SHARE_ACCESS_LEVEL_OPTIONS.filter(
          // Full access lets its holder manage sharing, so it is only granted by name
          (option) => option.value !== RecordShareAccessLevel.FULL,
        ).map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            selected={generalAccessLevel === option.value}
            disabled={generalAccessLevel === option.value || saving}
            onSelect={() => {
              void setGeneralAccess(option.value);
            }}
          >
            {withDefaultMarker(t(option.label), option.value)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </SidePanelShareRecordDropdownItem>
  );
};
