import { type RecordSharingTargetInput } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';
import { IconShare } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { RecordSharingDropdownContent } from '@/object-record/record-sharing/components/RecordSharingDropdownContent';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { Dropdown } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordSharingDropdownProps = {
  target: RecordSharingTargetInput;
  title: string;
  recordUrl: string;
};

export const RecordSharingDropdown = ({
  target,
  title,
  recordUrl,
}: RecordSharingDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = `record-sharing-${target.objectMetadataId}-${target.recordId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const sharingState = useRecordSharing({
    recordTarget: target,
    isOpen: isDropdownOpen,
  });

  return (
    <>
      <RecordSharingRefreshEffect refetch={sharingState.refetch} />
      {sharingState.sharing?.isEnabled === true && (
        <DropdownRoot
          dropdownId={dropdownId}
          type="menu"
          onOpenChange={(open) => {
            if (open) {
              void sharingState.refetch().catch(() => {});
            }
          }}
        >
          <Dropdown.Trigger
            render={
              <Button
                size="sm"
                variant="outline"
                startIcon={<IconShare />}
              >{t`Share`}</Button>
            }
          />
          <Dropdown.Content width={320} align="end" aria-label={title}>
            <RecordSharingDropdownContent
              title={title}
              recordUrl={recordUrl}
              sharingState={sharingState}
            />
          </Dropdown.Content>
        </DropdownRoot>
      )}
    </>
  );
};
