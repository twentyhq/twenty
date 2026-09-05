import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ShareRecordPrincipalPickerDropdown } from '@/record-share/components/ShareRecordPrincipalPickerDropdown';
import { SHARE_RECORD_ACCESS_LEVEL_SELECT_DROPDOWN_ID } from '@/record-share/constants/ShareRecordAccessLevelSelectDropdownId';
import { SHARE_RECORD_PRINCIPAL_PICKER_DROPDOWN_ID } from '@/record-share/constants/ShareRecordPrincipalPickerDropdownId';
import { useRecordShareAccessLevelOptions } from '@/record-share/hooks/useRecordShareAccessLevelOptions';
import { type ShareRecordPrincipal } from '@/record-share/types/ShareRecordPrincipal';
import { Select } from '@/ui/input/components/Select';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import {
  type RecordShare,
  RecordShareAccessLevel,
  type ShareWithInput,
} from '~/generated-metadata/graphql';

const StyledForm = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPrincipalButtonContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

type ShareRecordAddGrantFormProps = {
  shares: Pick<RecordShare, 'principalId' | 'principalType'>[];
  onShare: (shareWith: ShareWithInput) => Promise<unknown>;
};

export const ShareRecordAddGrantForm = ({
  shares,
  onShare,
}: ShareRecordAddGrantFormProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const accessLevelOptions = useRecordShareAccessLevelOptions();

  const [selectedPrincipal, setSelectedPrincipal] =
    useState<ShareRecordPrincipal | null>(null);
  const [accessLevel, setAccessLevel] = useState(RecordShareAccessLevel.READ);

  const handleSelectPrincipal = (principal: ShareRecordPrincipal) => {
    closeDropdown(SHARE_RECORD_PRINCIPAL_PICKER_DROPDOWN_ID);
    setSelectedPrincipal(principal);
  };

  const handleShare = async () => {
    if (!isDefined(selectedPrincipal)) {
      return;
    }

    await onShare({ ...selectedPrincipal.shareWith, accessLevel });
    setSelectedPrincipal(null);
  };

  return (
    <StyledForm>
      <StyledPrincipalButtonContainer>
        <Dropdown
          dropdownId={SHARE_RECORD_PRINCIPAL_PICKER_DROPDOWN_ID}
          isDropdownInModal
          clickableComponent={
            <Button
              Icon={IconPlus}
              title={selectedPrincipal?.label ?? t`Add people or roles`}
              variant="secondary"
              fullWidth
              justify="flex-start"
            />
          }
          dropdownComponents={
            <ShareRecordPrincipalPickerDropdown
              shares={shares}
              onSelect={handleSelectPrincipal}
            />
          }
        />
      </StyledPrincipalButtonContainer>
      <Select
        dropdownId={SHARE_RECORD_ACCESS_LEVEL_SELECT_DROPDOWN_ID}
        isDropdownInModal
        options={accessLevelOptions}
        value={accessLevel}
        onChange={setAccessLevel}
        selectSizeVariant="small"
      />
      <Button
        title={t`Share`}
        variant="primary"
        accent="blue"
        disabled={!isDefined(selectedPrincipal)}
        onClick={handleShare}
      />
    </StyledForm>
  );
};
