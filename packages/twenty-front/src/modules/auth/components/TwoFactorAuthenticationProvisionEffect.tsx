/* @license Enterprise */

import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import React, { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AppPath } from '@/types/AppPath';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { getLoginToken } from '@/apollo/utils/getLoginToken';
import { qrCodeState } from '@/auth/states/qrCode';
import { Loader } from 'twenty-ui/feedback';
import QRCode from "react-qr-code";
import { Trans } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';
import { SignInUpStep, signInUpStepState } from '@/auth/states/signInUpStepState';

const StyledMainContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  space-y: 5px;
`;

const StyledTextContainer = styled.div`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};
  
  max-width: 280px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.sm};

  & > a {
    color: ${({ theme }) => theme.font.color.tertiary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledForm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TwoFactorAuthenticationSetupEffect = () => {
  const { initiateTwoFactorAuthenticationProvisioning } = useAuth()

  const { enqueueSnackBar } = useSnackBar();

  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { origin } = useOrigin()
  const loginToken = getLoginToken();
  const setQrCodeState = useSetRecoilState(qrCodeState);
  const qrCode = useRecoilValue(qrCodeState);

  const { t } = useLingui();

  useEffect(() => {
    const handleTwoFactorAuthenticationProvisioning = async () => {
      try {
        if (!loginToken) {
          enqueueSnackBar(t`Invalid email verification link.`, {
            dedupeKey: 'email-verification-link-dedupe-key',
            variant: SnackBarVariant.Error,
          });
          return navigate(AppPath.SignInUp);
        }

        const token = await readCaptchaToken();
        const ts = await initiateTwoFactorAuthenticationProvisioning({
          variables: {
            loginToken: loginToken,
            captchaToken: token,
            origin
          }
        });

        if (!ts.data?.initiateTwoFactorAuthenticationProvisioning.uri) return

        setQrCodeState(ts.data?.initiateTwoFactorAuthenticationProvisioning.uri);

        enqueueSnackBar(t`Two factor authentication provisioning initiated.`, {
          dedupeKey: 'two-factor-authentication-provisioning-initiation-dedupe-key',
          variant: SnackBarVariant.Success,
        });
      } catch (error) {
        console.log({error})
        // const message: string =
        //   error instanceof ApolloError
        //     ? error.message
        //     : 'Email verification failed';

        // enqueueSnackBar(t`${message}`, {
        //   dedupeKey: 'email-verification-error-dedupe-key',
        //   variant: SnackBarVariant.Error,
        // });
        // if (
        //   error instanceof ApolloError &&
        //   error.graphQLErrors[0].extensions?.subCode ===
        //     'EMAIL_ALREADY_VERIFIED'
        // ) {
        //   navigate(AppPath.SignInUp);
        // }

        // setIsError(true);
      }
    };

    handleTwoFactorAuthenticationProvisioning();

    // Verify email only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
