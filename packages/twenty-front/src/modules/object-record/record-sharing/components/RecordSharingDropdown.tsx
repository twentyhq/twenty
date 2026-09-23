import { type RecordSharingTargetInput } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';
import { IconShare } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { RecordSharingDropdownContent } from '@/object-record/record-sharing/components/RecordSharingDropdownContent';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordSharingDropdownProps = {
  target: RecordSharingTargetInput;
  title: string;
  description: string;
  recordUrl: string;
};

export const RecordSharingDropdown = ({
  target,
  title,
  description,
  recordUrl,
}: RecordSharingDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = `record-sharing-${target.objectMetadataId}-${target.recordId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const sharingState = useRecordSharing(target, isDropdownOpen);

  return (
    <>
      <RecordSharingRefreshEffect refetch={sharingState.refetch} />
      {sharingState.sharing?.isEnabled === true && (
        <Dropdown
          dropdownId={dropdownId}
          onOpen={() => {
            void sharingState.refetch().catch(() => {});
          }}
          dropdownPlacement="bottom-end"
          clickableComponent={
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconShare />}
            >{t`Share`}</Button>
          }
          dropdownComponents={
            <RecordSharingDropdownContent
              title={title}
              description={description}
              recordUrl={recordUrl}
              sharingState={sharingState}
            />
          }
        />
      )}
    </>
  );
};
