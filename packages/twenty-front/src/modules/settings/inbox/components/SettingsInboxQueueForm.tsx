import { styled } from '@linaria/react';
import { INBOX_QUEUE_LABEL_MAX_LENGTH } from 'twenty-shared/constants';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Section } from 'twenty-ui/components';

import { SettingsInboxQueueRolePicker } from '@/settings/inbox/components/SettingsInboxQueueRolePicker';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledNameRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNameInput = styled.div`
  flex: 1;
`;

export type InboxQueueDraft = {
  label: string;
  icon: string;
  roleIds: string[];
};

// The address is derived from the label once and then never moves, so it is
// not editable here.
export const SettingsInboxQueueForm = ({
  draft,
  onChange,
}: {
  draft: InboxQueueDraft;
  onChange: (draft: InboxQueueDraft) => void;
}) => {
  const { t } = useLingui();

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Name`}
          description={t`What this shared inbox is called in the navigation`}
        />
        <StyledNameRow>
          <IconPicker
            selectedIconKey={draft.icon}
            onChange={({ iconKey }) => onChange({ ...draft, icon: iconKey })}
          />
          <StyledNameInput>
            <TextInput
              value={draft.label}
              onChange={(label) => onChange({ ...draft, label })}
              placeholder={t`Support`}
              maxLength={INBOX_QUEUE_LABEL_MAX_LENGTH}
              fullWidth
            />
          </StyledNameInput>
        </StyledNameRow>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Access`}
          description={t`Roles that can open this inbox. Work sent here belongs to all of them until someone takes it`}
        />
        <SettingsInboxQueueRolePicker
          selectedRoleIds={draft.roleIds}
          onChange={(roleIds) => onChange({ ...draft, roleIds })}
        />
      </Section.Root>
    </>
  );
};
