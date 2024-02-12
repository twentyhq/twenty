import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { IconChevronRight } from '@/ui/display/icon';
import { IconGmail } from '@/ui/display/icon/components/IconGmail';
import { Status } from '@/ui/display/status/components/Status';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Card } from '@/ui/layout/card/components/Card';

import { SettingsAccountRow } from './SettingsAccountsRow';

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
`;

type SettingsAccountsEmailsCardProps = {
  messageChannels: MessageChannel[];
};

export const SettingsAccountsEmailsCard = ({
  messageChannels,
}: SettingsAccountsEmailsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      {messageChannels.map((messageChannel, index) => (
        <SettingsAccountRow
          key={messageChannel.id}
          LeftIcon={IconGmail}
          account={messageChannel}
          rightComponent={
            <StyledRightContainer>
              {messageChannel.isSynced ? (
                <Status color="green" text="Synced" weight="medium" />
              ) : (
                <Status color="gray" text="Not Synced" weight="medium" />
              )}
              <LightIconButton Icon={IconChevronRight} accent="tertiary" />
            </StyledRightContainer>
          }
          onClick={() =>
            navigate(`/settings/accounts/emails/${messageChannel.id}`)
          }
          divider={index < messageChannels.length - 1}
        />
      ))}
    </Card>
  );
};
