import { styled } from '@linaria/react';
import { useState } from 'react';

import { MemberEmailField } from '@/settings/members/components/MemberEmailField';
import { MemberNameFields } from '@/settings/members/components/MemberNameFields';
import { WorkspaceMemberPictureUploader } from '@/settings/workspace-member/components/WorkspaceMemberPictureUploader';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type MemberInfosTabProps = {
  member: WorkspaceMember;
  onNameChange: (firstName: string, lastName: string) => void;
  onImpersonate?: () => void;
  onDelete: () => void;
};

const StyledNameRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const StyledActionRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const MemberInfosTab = ({
  member,
  onNameChange,
  onImpersonate,
  onDelete,
}: MemberInfosTabProps) => {
  const [firstName, setFirstName] = useState(member.name.firstName);
  const [lastName, setLastName] = useState(member.name.lastName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    member.avatarUrl || null,
  );

  return (
    <>
      <Section.Root>
        <Section.Header title={t`Picture`} />
        <WorkspaceMemberPictureUploader
          workspaceMemberId={member.id}
          avatarUrl={avatarUrl}
          onAvatarUpdated={setAvatarUrl}
        />
      </Section.Root>

      <Section.Root>
        <Section.Header
          title={t`Name`}
          description={t`As it will be displayed in the workspace`}
        />
        <StyledNameRow>
          <MemberNameFields
            memberId={member.id}
            firstName={firstName}
            lastName={lastName}
            onChange={(field, value) => {
              if (field === 'firstName') {
                setFirstName(value);
                onNameChange(value, lastName);
              } else {
                setLastName(value);
                onNameChange(firstName, value);
              }
            }}
          />
        </StyledNameRow>
      </Section.Root>

      <Section.Root>
        <Section.Header
          title={t`Email`}
          description={t`The email associated to this account`}
        />
        <MemberEmailField email={member.userEmail} />
      </Section.Root>

      <Section.Root>
        <Section.Header
          title={t`Admin`}
          description={t`Perform administrative actions or permanently delete this user`}
        />
        <StyledActionRow>
          {onImpersonate && (
            <Button
              size="sm"
              onClick={onImpersonate}
              variant="outline"
            >{t`Impersonate`}</Button>
          )}
          <Button
            size="sm"
            onClick={onDelete}
            variant="outline"
            color="danger"
          >{t`Delete account`}</Button>
        </StyledActionRow>
      </Section.Root>
    </>
  );
};
