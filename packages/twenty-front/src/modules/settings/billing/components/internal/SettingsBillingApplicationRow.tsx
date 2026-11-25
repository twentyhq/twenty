import { ApplicationDisplay } from '@/applications/components/ApplicationDisplay';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  ApplicationBillingPriceUnit,
  FindApplicationRegistrationByUniversalIdentifierDocument,
} from '~/generated-metadata/graphql';

const StyledApplicationRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledApplicationName = styled.div`
  min-width: 0;
`;

const StyledApplicationAmount = styled.div`
  white-space: nowrap;
`;

export type SettingsBillingApplicationRowProps = {
  applicationSubscriptionItem: {
    quantity?: number | null;
    unitAmount?: number | null;
    billingProduct: {
      name: string;
      metadata: {
        applicationUniversalIdentifier?: string | null;
        applicationPriceUniversalIdentifier?: string | null;
      };
    };
  };
  isYearlyPlan: boolean;
};

export const SettingsBillingApplicationRow = ({
  applicationSubscriptionItem,
  isYearlyPlan,
}: SettingsBillingApplicationRowProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const { name, metadata } = applicationSubscriptionItem.billingProduct;
  const quantity = applicationSubscriptionItem.quantity ?? 0;
  const unitAmountCents = applicationSubscriptionItem.unitAmount ?? 0;

  const { data } = useQuery(
    FindApplicationRegistrationByUniversalIdentifierDocument,
    {
      variables: {
        universalIdentifier: metadata.applicationUniversalIdentifier ?? '',
      },
      skip: !isDefined(metadata.applicationUniversalIdentifier),
    },
  );

  const applicationRegistration =
    data?.findApplicationRegistrationByUniversalIdentifier;

  const applicationPricePer = applicationRegistration?.billingPrices?.find(
    (billingPrice) =>
      billingPrice.universalIdentifier ===
      metadata.applicationPriceUniversalIdentifier,
  )?.per;

  const formatMonthlyAmount = (cents: number) =>
    `$${formatNumber((isYearlyPlan ? cents / 12 : cents) / 100, {
      decimals: 2,
    })}`;

  const formatQuantity = () => {
    if (!isDefined(applicationPricePer)) {
      return `${quantity}`;
    }

    switch (applicationPricePer) {
      case ApplicationBillingPriceUnit.WORKSPACE_MEMBER:
        return quantity === 1 ? t`${quantity} member` : t`${quantity} members`;
      case ApplicationBillingPriceUnit.CONNECTED_ACCOUNT:
        return quantity === 1
          ? t`${quantity} account`
          : t`${quantity} accounts`;
      default:
        return assertUnreachable(applicationPricePer);
    }
  };

  return (
    <StyledApplicationRow>
      <StyledApplicationName>
        <ApplicationDisplay
          application={{
            name: applicationRegistration?.name ?? name,
            logoUrl: applicationRegistration?.logoUrl,
          }}
        />
      </StyledApplicationName>
      <StyledApplicationAmount>
        <Text render={<span />} size="md" color="tertiary">
          {`${formatQuantity()} × ${formatMonthlyAmount(unitAmountCents)} · `}
        </Text>
        <Text render={<span />} size="md">
          {formatMonthlyAmount(quantity * unitAmountCents)}
        </Text>
      </StyledApplicationAmount>
    </StyledApplicationRow>
  );
};
