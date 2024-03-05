import styled from '@emotion/styled';
import { IconCurrencyDollar } from '@tabler/icons-react';

import { ManageYourSubscription } from '@/billing/components/ManageYourSubscription.tsx';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { H1Title } from '@/ui/display/typography/components/H1Title.tsx';
import { H2Title } from '@/ui/display/typography/components/H2Title.tsx';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section.tsx';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsBilling = () => (
  <SubMenuTopBarContainer Icon={IconCurrencyDollar} title="Billing">
    <SettingsPageContainer>
      <StyledH1Title title="Billing" />
      <Section>
        <H2Title
          title="Manage your subscription"
          description="Edit payment method, see your invoices and more"
        />
        <ManageYourSubscription />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
