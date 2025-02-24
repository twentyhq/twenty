import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import {
  StripeContext,
  StripeIntegrationContextType,
} from '~/pages/settings/integrations/stripe/context/StripeContext';
import StripeAccountConnectedContainer from '~/pages/settings/integrations/stripe/components/StripeAccountConnectedContainer';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconButton } from '@ui/input/button/components/IconButton';
import { IconTrash } from '@ui/display/icon/components/TablerIcons';
import { useFindAllStripeIntegrations } from '~/pages/settings/integrations/stripe/hooks/useFindAllStripeIntegrations';
import { useRemoveStripeIntegration } from '~/pages/settings/integrations/stripe/hooks/useRemoveStripeIntegrations';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationGroup } from '../../components/SettingsIntegrationGroup';

type SettigsIntegrationStripeConnectionsListCardProps = {
  integration: SettingsIntegration;
  connections: any[];
};

const StyledDatabaseLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledDatabaseLogo = styled.img`
  height: 100%;
`;

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const IsActiveContainer = styled.div`
  width: 65%;
  height: 25px;
  border-radius: 10px;
  background: #3cb3726c;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
`;

const IsActiveContent = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

export const SettigsIntegrationStripeConnectionsListCard = () => {
  const { enqueueSnackBar } = useSnackBar();

  const { createCheckoutSession } = useContext(
    StripeContext,
  ) as StripeIntegrationContextType;

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [refresh, setRefresh] = useState<boolean>(false);

  const { stripeIntegrations = [], refetchStripe } =
    useFindAllStripeIntegrations();
  const { deleteStripeIntegration } = useRemoveStripeIntegration();

  useEffect(() => {}, [refetchStripe]);

  const handleEditIntegration = (connId: string) => {
    navigate(`./edit/${connId}`);
  };

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

  console.log('stripe', stripeIntegrations);
  console.log('ref', { refetchStripe });

  const integrationCategories = useSettingsIntegrationCategories();
  const stripeCategory = integrationCategories[3];

  return (
    <>
      {stripeIntegrations.length > 0 ? (
        <StripeAccountConnectedContainer>
          <IsActiveContent>
            <img
              src="/images/integrations/stripe-logo.png"
              width={'24px'}
              alt=""
            />
            <span style={{ color: 'gray', fontWeight: '600' }}>
              Now you can collect payments from your customers
            </span>
          </IsActiveContent>

          <IsActiveContent>
            <IsActiveContainer>
              <span style={{ color: '#257047', fontWeight: '600' }}>
                • Active
              </span>
            </IsActiveContainer>

            <IconButton
              onClick={() =>
                handleDeleteIntegration(stripeIntegrations[0].accountId)
              }
              variant="tertiary"
              size="medium"
              Icon={IconTrash}
            />
          </IsActiveContent>

          {/* <button onClick={() => handleCheckoutSession()}>checkout</button> */}
        </StripeAccountConnectedContainer>
      ) : (
        <SettingsIntegrationGroup key={stripeCategory.key} integrationGroup={stripeCategory} />
      )}
    </>
  );
};
