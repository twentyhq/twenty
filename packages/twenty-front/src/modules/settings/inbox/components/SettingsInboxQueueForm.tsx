import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';

import { SettingsInboxQueueMemberPicker } from '@/settings/inbox/components/SettingsInboxQueueMemberPicker';
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
  name: string;
  icon: string;
  memberWorkspaceMemberIds: string[];
};

// One form for creating and editing, because both collect the same three
// things. The address is derived from the name once and then never moves, so it
// is not editable here.
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
      <Section>
        <H2Title
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
              value={draft.name}
              onChange={(name) => onChange({ ...draft, name })}
              placeholder={t`Support`}
              fullWidth
            />
          </StyledNameInput>
        </StyledNameRow>
      </Section>
      <Section>
        <H2Title
          title={t`Members`}
          description={t`Work sent here belongs to everyone who watches it until someone takes it`}
        />
        <SettingsInboxQueueMemberPicker
          selectedWorkspaceMemberIds={draft.memberWorkspaceMemberIds}
          onChange={(memberWorkspaceMemberIds) =>
            onChange({ ...draft, memberWorkspaceMemberIds })
          }
        />
      </Section>
    </>
  );
};
