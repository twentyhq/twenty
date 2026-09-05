import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ShareRecordPrincipalPickerDropdown } from '@/record-share/components/ShareRecordPrincipalPickerDropdown';
import { type ShareRecordPrincipal } from '@/record-share/types/ShareRecordPrincipal';
import { useSharingRuleAccessLevelOptions } from '@/settings/data-model/sharing/hooks/useSharingRuleAccessLevelOptions';
import { useSharingRuleMutations } from '@/settings/data-model/sharing/hooks/useSharingRuleMutations';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import {
  type CreateSharingRuleInput,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from '~/generated-metadata/graphql';

const NEW_SHARING_RULE_GRANTEE_DROPDOWN_ID = 'new-sharing-rule-grantee';

const StyledForm = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledGranteeContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const toGrantee = (
  principal: ShareRecordPrincipal,
): Pick<
  CreateSharingRuleInput,
  'granteePrincipalType' | 'granteeRoleId' | 'granteePrincipalId'
> => {
  if (isDefined(principal.shareWith.roleId)) {
    return {
      granteePrincipalType: RecordSharePrincipalType.ROLE,
      granteeRoleId: principal.shareWith.roleId,
    };
  }

  if (isDefined(principal.shareWith.workspaceMemberId)) {
    return {
      granteePrincipalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      granteePrincipalId: principal.shareWith.workspaceMemberId,
    };
  }

  return { granteePrincipalType: RecordSharePrincipalType.EVERYONE };
};

type SettingsObjectSharingRuleFormProps = {
  objectMetadataId: string;
  onCreated: () => void;
};

export const SettingsObjectSharingRuleForm = ({
  objectMetadataId,
  onCreated,
}: SettingsObjectSharingRuleFormProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const accessLevelOptions = useSharingRuleAccessLevelOptions();
  const { createSharingRule } = useSharingRuleMutations();

  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState<ShareRecordPrincipal | null>(null);
  const [accessLevel, setAccessLevel] = useState(RecordShareAccessLevel.READ);

  const handleSelectPrincipal = (selectedPrincipal: ShareRecordPrincipal) => {
    closeDropdown(NEW_SHARING_RULE_GRANTEE_DROPDOWN_ID);
    setPrincipal(selectedPrincipal);
  };

  const handleCreate = async () => {
    if (!isDefined(principal)) {
      return;
    }

    await createSharingRule({
      objectMetadataId,
      name: isNonEmptyString(name.trim()) ? name.trim() : principal.label,
      accessLevel,
      ...toGrantee(principal),
    });
    onCreated();
  };

  return (
    <StyledForm>
      <TextInput
        label={t`Name`}
        placeholder={t`Rule name`}
        value={name}
        onChange={setName}
      />
      <StyledGranteeContainer>
        <Dropdown
          dropdownId={NEW_SHARING_RULE_GRANTEE_DROPDOWN_ID}
          clickableComponent={
            <Button
              Icon={IconPlus}
              title={principal?.label ?? t`Choose who gets access`}
              variant="secondary"
              fullWidth
              justify="flex-start"
            />
          }
          dropdownComponents={
            <ShareRecordPrincipalPickerDropdown
              shares={[]}
              onSelect={handleSelectPrincipal}
            />
          }
        />
      </StyledGranteeContainer>
      <Select
        dropdownId="new-sharing-rule-access-level"
        label={t`Access level`}
        options={accessLevelOptions}
        value={accessLevel}
        onChange={setAccessLevel}
      />
      <Button
        title={t`Create rule`}
        variant="primary"
        accent="blue"
        disabled={!isDefined(principal)}
        onClick={handleCreate}
      />
    </StyledForm>
  );
};
