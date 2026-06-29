import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { AnimatedEaseIn } from 'twenty-ui/layout';
import { ModalContent } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type SaaSBusiness = {
  id: string;
  name: string;
};

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 320px;
`;

const StyledBusinessList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBusinessButton = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.color.blue10
      : themeCssVariables.color.backgroundPrimary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font: inherit;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
`;

const StyledErrorText = styled.div`
  color: ${themeCssVariables.color.red};
  text-align: center;
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[8]};
`;

export const SaaSSelectBusiness = () => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const pendingLoginToken = searchParams.get('pendingLoginToken');

  const [businesses, setBusinesses] = useState<SaaSBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const pendingLoginUrl = useMemo(() => {
    if (!pendingLoginToken) {
      return;
    }

    const url = new URL(`${REACT_APP_SERVER_BASE_URL}/auth/saas/pending-login`);

    url.searchParams.set('pendingLoginToken', pendingLoginToken);

    return url.toString();
  }, [pendingLoginToken]);

  useEffect(() => {
    const loadPendingLogin = async () => {
      if (!pendingLoginUrl) {
        setError(t`This CRM login link is missing required information.`);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(pendingLoginUrl);

        if (!response.ok) {
          throw new Error('Unable to load pending login');
        }

        const data = (await response.json()) as { businesses: SaaSBusiness[] };

        setBusinesses(data.businesses);
        setSelectedBusinessId(data.businesses[0]?.id);
      } catch {
        setError(t`This CRM login link is invalid or expired.`);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPendingLogin();
  }, [pendingLoginUrl, t]);

  const handleContinue = async () => {
    if (!pendingLoginToken || !selectedBusinessId) {
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/auth/saas/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pendingLoginToken,
            businessId: selectedBusinessId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Unable to complete CRM login');
      }

      const data = (await response.json()) as { redirectUrl: string };

      window.location.href = data.redirectUrl;
    } catch {
      setError(
        t`Unable to complete CRM login. Please try again from SmartBiz.`,
      );
      setIsSubmitting(false);
    }
  };

  const hasBusinesses = businesses.length > 0;

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>
      <Title animate>{t`Choose a business`}</Title>
      <StyledContent>
        {isLoading ? (
          <StyledLoaderContainer>
            <Loader color="gray" />
          </StyledLoaderContainer>
        ) : (
          <>
            {error && <StyledErrorText>{error}</StyledErrorText>}
            {hasBusinesses && (
              <>
                <StyledBusinessList>
                  {businesses.map((business) => (
                    <StyledBusinessButton
                      key={business.id}
                      type="button"
                      isSelected={business.id === selectedBusinessId}
                      onClick={() => setSelectedBusinessId(business.id)}
                    >
                      {business.name}
                    </StyledBusinessButton>
                  ))}
                </StyledBusinessList>
                <MainButton
                  title={t`Continue`}
                  variant="secondary"
                  fullWidth
                  disabled={!isDefined(selectedBusinessId) || isSubmitting}
                  onClick={handleContinue}
                />
              </>
            )}
          </>
        )}
      </StyledContent>
    </ModalContent>
  );
};
