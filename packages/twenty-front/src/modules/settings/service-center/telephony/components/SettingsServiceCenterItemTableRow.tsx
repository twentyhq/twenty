import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(3)};
  overflow: auto;
`;

const StyledStatusContainer = styled.div`
  width: 25%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledEmailText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledExtensionText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledExtensionContentText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

type SettingsServiceCenterItemTableRowProps = {
  telephony: Telephony;
  accessory?: React.ReactNode;
};

export const SettingsServiceCenterItemTableRow = ({
  telephony,
  accessory,
}: SettingsServiceCenterItemTableRowProps) => {
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const member = workspaceMembers.find(
    (wsMember) => wsMember.id === telephony.memberId,
  );

  return (
    <StyledContainer>
      <Avatar
        avatarUrl={member?.avatarUrl}
        placeholderColorSeed={telephony.id}
        placeholder={member?.name.firstName + ' ' + member?.name.lastName}
        type="rounded"
        size="lg"
      />
      <StyledContent>
        <OverflowingTextWithTooltip
          text={member?.name.firstName + ' ' + member?.name.lastName}
        />
        <StyledEmailText>{member?.userEmail}</StyledEmailText>
      </StyledContent>
      <StyledStatusContainer>
        <div>
          <StyledExtensionText>Ramal: </StyledExtensionText>
          <StyledExtensionContentText>
            {telephony.numberExtension}
          </StyledExtensionContentText>
        </div>
        {accessory}
      </StyledStatusContainer>
    </StyledContainer>
  );
};
