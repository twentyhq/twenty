import react from 'react';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { BillingDetailsButton, ChangeSubscriptionButton, CancelSubscriptionButton } from '~/pages/settings/billing/SettingsBillingPlanButtons';

export const SettingsBillingPlan = () => {
    return (
        <SubMenuTopBarContainer
            title={'Billing'}
                  links={[
                    {
                      children: 'Billing',
                      href: getSettingsPath(SettingsPath.BillingPlan),
                    },
                    { children: 'Billing' },
                  ]}
        >
            <SettingsPageContainer>
                <Section>
                    <H2Title
                        title={'Manage your subscription'}
                        description={'Edit payment method, see your invoices and more'}
                    />

                <BillingDetailsButton />
                </Section>

                <Section>
                    <H2Title
                        title={'Change subscription plan'}
                        description={'Allows you to view and modify your current subscription plans'}
                    />

                    <ChangeSubscriptionButton />
                </Section>

                <Section>
                    <H2Title
                        title={'Cancel your subscription'}
                        description={'Your workspace will be disabled'}
                    />

                    <CancelSubscriptionButton />
                </Section>
            </SettingsPageContainer>
        </SubMenuTopBarContainer>
    );
}