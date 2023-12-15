import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { Account } from '@/accounts/types/Account';
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
  accounts: Account[];
};

export const SettingsAccountsEmailsCard = ({
  accounts,
}: SettingsAccountsEmailsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      {accounts.map((account, index) => (
        <SettingsAccountRow
          key={account.uuid}
          LeftIcon={IconGmail}
          account={account}
          rightComponent={
            <StyledRightContainer>
              {account.isSynced ? (
                <Status color="green" text="Synced" weight="medium" />
              ) : (
                <Status color="gray" text="Not Synced" weight="medium" />
              )}
              <LightIconButton Icon={IconChevronRight} accent="tertiary" />
            </StyledRightContainer>
          }
          onClick={() => navigate(`/settings/accounts/emails/${account.uuid}`)}
          divider={index < accounts.length - 1}
        />
      ))}
    </Card>
  );
};
