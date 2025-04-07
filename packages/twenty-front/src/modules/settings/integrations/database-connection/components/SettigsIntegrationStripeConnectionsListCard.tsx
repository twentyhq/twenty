import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetDatabaseConnections } from '@/databases/hooks/useGetDatabaseConnections';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { IconChevronRight, IconTrash } from 'twenty-ui/display';
import { IconButton, LightIconButton } from 'twenty-ui/input';

import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import StripeAccountConnectedContainer from '~/pages/settings/integrations/stripe/components/StripeAccountConnectedContainer';
import { useCreateCheckoutSession } from '~/pages/settings/integrations/stripe/hooks/useCreateCheckoutSession';
import { useFindAllStripeIntegrations } from '~/pages/settings/integrations/stripe/hooks/useFindAllStripeIntegrations';
import { useRemoveStripeIntegration } from '~/pages/settings/integrations/stripe/hooks/useRemoveStripeIntegrations';

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
  const { databaseKey = '' } = useParams();
  const [integrationCategoryAll] = useSettingsIntegrationCategories();

  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const navigate = useNavigateSettings();
  const isIntegrationAvailable = !!integration;

  const { connections } = useGetDatabaseConnections({
    databaseKey,
    skip: !isIntegrationAvailable,
  });

  if (!isIntegrationAvailable) return null;

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
        <SettingsListCard
          items={connections}
          RowIcon={() => (
            <StyledDatabaseLogoContainer>
              <StyledDatabaseLogo alt="" src={integration.from.image} />
            </StyledDatabaseLogoContainer>
          )}
          RowRightComponent={({ item: connection }) => (
            <StyledRowRightContainer>
              <LightIconButton Icon={IconChevronRight} accent="tertiary" />
            </StyledRowRightContainer>
          )}
          onRowClick={(connection) =>
            navigate(SettingsPath.IntegrationDatabaseConnection, {
              databaseKey: integration.from.key,
              connectionId: connection.id,
            })
          }
          getItemLabel={(connection) => connection.label}
          hasFooter
          footerButtonLabel="Add connection"
          onFooterButtonClick={() =>
            navigate(SettingsPath.IntegrationNewDatabaseConnection, {
              databaseKey: integration.from.key,
            })
          }
        />
      )}
    </>
  );
};
