import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconTrash } from '@ui/display/icon/components/TablerIcons';
import { IconButton } from '@ui/input/button/components/IconButton';
import StripeAccountConnectedContainer from '~/pages/settings/integrations/stripe/components/StripeAccountConnectedContainer';
import { useCreateCheckoutSession } from '~/pages/settings/integrations/stripe/hooks/useCreateCheckoutSession';
import { useFindAllStripeIntegrations } from '~/pages/settings/integrations/stripe/hooks/useFindAllStripeIntegrations';
import { useRemoveStripeIntegration } from '~/pages/settings/integrations/stripe/hooks/useRemoveStripeIntegrations';
import { SettingsIntegrationGroup } from '../../components/SettingsIntegrationGroup';

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledIsActiveContainer = styled.div`
  width: 65%;
  height: 25px;
  border-radius: 10px;
  background: #3cb3726c;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
`;

const StyledIsActiveContent = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

export const SettigsIntegrationStripeConnectionsListCard = () => {
  const { enqueueSnackBar } = useSnackBar();

  const { createCheckoutSession } = useCreateCheckoutSession();

  const [refresh, setRefresh] = useState<boolean>(false);

  const { stripeIntegrations = [], refetchStripe } =
    useFindAllStripeIntegrations();
  const { deleteStripeIntegration } = useRemoveStripeIntegration();

  useEffect(() => {}, [refetchStripe]);

  const handleDeleteIntegration = async (id: string) => {
    try {
      await deleteStripeIntegration(id);

      enqueueSnackBar('Accont has been removed', {
        variant: SnackBarVariant.Success,
      });
      setRefresh(!refresh);
    } catch (error) {
      enqueueSnackBar('Failed to remove account', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleCheckoutSession = async () => {
    try {
      await createCheckoutSession(100, 'usd');
    } catch (error) {
      enqueueSnackBar('Failed to create checkout session', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const integrationCategories = useSettingsIntegrationCategories();
  const stripeCategory = integrationCategories[3];

  return (
    <>
      {stripeIntegrations.length > 0 ? (
        <StripeAccountConnectedContainer>
          <StyledIsActiveContent>
            <img
              src="/images/integrations/stripe-logo.png"
              width={'24px'}
              alt=""
            />
            <span style={{ color: 'gray', fontWeight: '600' }}>
              Now you can collect payments from your customers
            </span>
          </StyledIsActiveContent>

          <StyledIsActiveContent>
            <StyledIsActiveContainer>
              {/* eslint-disable-next-line @nx/workspace-no-hardcoded-colors  */}
              <span style={{ color: '#257047', fontWeight: '600' }}>
                • Active
              </span>
            </StyledIsActiveContainer>

            <IconButton
              onClick={() =>
                handleDeleteIntegration(stripeIntegrations[0].accountId)
              }
              variant="tertiary"
              size="medium"
              Icon={IconTrash}
            />
          </StyledIsActiveContent>

          {/* <button onClick={() => handleCheckoutSession()}>checkout</button> */}
        </StripeAccountConnectedContainer>
      ) : (
        <SettingsIntegrationGroup
          key={stripeCategory.key}
          integrationGroup={stripeCategory}
        />
      )}
    </>
  );
};
