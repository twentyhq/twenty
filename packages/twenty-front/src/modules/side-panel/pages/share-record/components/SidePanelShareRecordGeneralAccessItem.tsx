import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconLock, IconUsers } from 'twenty-ui/icon';

import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { type RecordSharingGrantDto } from '~/generated-metadata/graphql';

type SidePanelShareRecordGeneralAccessItemProps = {
  itemId: string;
  everyoneManualShare: RecordSharingGrantDto | undefined;
  hasWorkspaceAccess: boolean;
  saving: boolean;
  setShare: ReturnType<typeof useRecordSharing>['setShare'];
};

export const SidePanelShareRecordGeneralAccessItem = ({
  itemId,
  everyoneManualShare,
  hasWorkspaceAccess,
  saving,
  setShare,
}: SidePanelShareRecordGeneralAccessItemProps) => {
  const { t } = useLingui();

  return (
    <SidePanelShareRecordDropdownItem
      itemId={itemId}
      label={hasWorkspaceAccess ? t`Everyone in the workspace` : t`Restricted`}
      Icon={hasWorkspaceAccess ? IconUsers : IconLock}
      description={
        isDefined(everyoneManualShare)
          ? getRecordShareAccessLevelLabel(everyoneManualShare.accessLevel)
          : undefined
      }
      disabled={saving}
      width={240}
    >
      <Dropdown.Section>
        <Dropdown.OptionItem
          selected={!hasWorkspaceAccess}
          disabled={!isDefined(everyoneManualShare) || saving}
          onSelect={() => {
            void setShare({ principal: { everyone: true }, enabled: false });
          }}
        >{t`Restricted`}</Dropdown.OptionItem>
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section label={t`Everyone in the workspace`}>
        {RECORD_SHARE_ACCESS_LEVEL_OPTIONS.map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            selected={everyoneManualShare?.accessLevel === option.value}
            disabled={saving}
            onSelect={() => {
              void setShare({
                principal: { everyone: true },
                enabled: true,
                accessLevel: option.value,
              });
            }}
          >
            {t(option.label)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </SidePanelShareRecordDropdownItem>
  );
};
