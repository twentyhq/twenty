import { SettingsIntegrationCategory } from "@/settings/integrations/types/SettingsIntegrationCategory";

export const useSettingsIntegrationStripeCategory  = (): SettingsIntegrationCategory =>{    
    return {
        key: 'stripe',
        title: 'With Stripe',
        hyperlink: null,
        integrations: [
            {
                from: {
                key: 'stripe',
                image: '/images/integrations/stripe-logo.png',
                },
                to: null,
                type: 'Goto',
                text: 'Connect your Stripe account',
                link: undefined,
                linkText: 'Go to Stripe',
            },
        ],
    };
}