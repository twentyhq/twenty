import { Agent } from '@/settings/service-center/agents/types/Agent';
import { SelectStatus } from '@/settings/service-center/components/SelectStatus';
import styled from '@emotion/styled';
import {
  Avatar,
  IconPointFilled,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';

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

type SettingsServiceCenterItemTableRowProps = {
  agent: Agent;
  accessory?: React.ReactNode;
};

type StatusType = 'ACTIVE' | 'INACTIVE';

export const SettingsServiceCenterItemTableRow = ({
  agent,
  accessory,
}: SettingsServiceCenterItemTableRowProps) => {
  // const { t } = useTranslation();

  return (
    <StyledContainer>
      <Avatar
        avatarUrl={agent.workspaceMember?.avatarUrl ?? ''}
        placeholderColorSeed={agent.id}
        placeholder={agent.workspaceMember?.name.firstName || ''}
        type="rounded"
        size="lg"
      />
      <StyledContent>
        <OverflowingTextWithTooltip
          text={
            agent.workspaceMember?.name.firstName +
            ' ' +
            agent.workspaceMember?.name.lastName
          }
        />
        <StyledEmailText>
          {agent.workspaceMember?.userEmail ?? ''}
        </StyledEmailText>
      </StyledContent>
      <StyledStatusContainer>
        <SelectStatus
          dropdownId={`agent-status-${agent.id}`}
          options={[
            {
              Icon: IconPointFilled,
              label: 'Active',
              value: 'ACTIVE' as StatusType,
            },
            {
              Icon: IconPointFilled,
              label: 'Inactive',
              value: 'INACTIVE' as StatusType,
            },
          ]}
          value={agent.isActive ? 'ACTIVE' : 'INACTIVE'}
          onChange={() => {}}
          disabled={true}
        />
        {accessory}
      </StyledStatusContainer>
    </StyledContainer>
  );
};
