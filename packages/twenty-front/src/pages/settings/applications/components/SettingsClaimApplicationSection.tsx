import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCopy,
  IconEye,
  IconRefresh,
  IconSearch,
  IconUserPlus,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import {
  FindClaimableApplicationRegistrationDocument,
  FindManyApplicationRegistrationsDocument,
  FindPendingApplicationRegistrationClaimDocument,
  PermissionFlagType,
  StartApplicationRegistrationClaimDocument,
  SyncMarketplaceCatalogDocument,
  VerifyApplicationRegistrationClaimDocument,
} from '~/generated-metadata/graphql';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInputContainer = styled.div`
  flex: 1;
`;

const StyledResultCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledResultTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledCodeBlock = styled.pre`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-family: ${themeCssVariables.font.family};
  margin: 0;
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[3]};
  white-space: pre;
`;

const buildPackageJsonSnippet = (claimCode: string) =>
  `"twenty": {\n  "claimCode": "${claimCode}"\n}`;

export const SettingsClaimApplicationSection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { copyToClipboard } = useCopyToClipboard();

  const [lookupValue, setLookupValue] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [pendingClaimCode, setPendingClaimCode] = useState<string | null>(null);

  const canSyncCatalog = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
  );

  const [runLookup, { data: lookupData, loading: isLookingUp }] = useLazyQuery(
    FindClaimableApplicationRegistrationDocument,
    { fetchPolicy: 'network-only' },
  );

  const [runPendingClaimLookup] = useLazyQuery(
    FindPendingApplicationRegistrationClaimDocument,
    { fetchPolicy: 'network-only' },
  );

  const [startClaim, { loading: isStarting }] = useMutation(
    StartApplicationRegistrationClaimDocument,
  );

  const [verifyClaim, { loading: isVerifying }] = useMutation(
    VerifyApplicationRegistrationClaimDocument,
    { refetchQueries: [FindManyApplicationRegistrationsDocument] },
  );

  const [syncCatalog, { loading: isSyncing }] = useMutation(
    SyncMarketplaceCatalogDocument,
  );

  const registration = lookupData?.findClaimableApplicationRegistration ?? null;

  const handleLookup = async () => {
    const trimmed = lookupValue.trim();

    if (trimmed.length === 0) {
      return;
    }

    setNotFound(false);
    setChallengeCode(null);
    setPendingClaimCode(null);

    const variables = UUID_REGEX.test(trimmed)
      ? { universalIdentifier: trimmed }
      : { sourcePackage: trimmed };

    try {
      const result = await runLookup({ variables });

      const foundRegistration =
        result.data?.findClaimableApplicationRegistration;

      if (!isDefined(foundRegistration)) {
        setNotFound(true);

        return;
      }

      if (!foundRegistration.isOwned) {
        const pendingClaimResult = await runPendingClaimLookup({
          variables: { applicationRegistrationId: foundRegistration.id },
        });

        setPendingClaimCode(
          pendingClaimResult.data?.findPendingApplicationRegistrationClaim
            ?.token ?? null,
        );
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Could not run the lookup`,
      });
    }
  };

  const handleStartClaim = async () => {
    if (!isDefined(registration)) {
      return;
    }

    try {
      const result = await startClaim({
        variables: { applicationRegistrationId: registration.id },
      });

      const token =
        result.data?.startApplicationRegistrationClaim?.token ?? null;

      setChallengeCode(token);
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Could not start the claim`,
      });
    }
  };

  const handleVerifyClaim = async () => {
    if (!isDefined(registration)) {
      return;
    }

    try {
      await verifyClaim({
        variables: { applicationRegistrationId: registration.id },
      });

      enqueueSuccessSnackBar({ message: t`Application claimed successfully` });

      navigate(SettingsPath.ApplicationRegistrationDetail, {
        applicationRegistrationId: registration.id,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not verify the claim`,
      });
    }
  };

  const handleSync = async () => {
    try {
      await syncCatalog();
      enqueueSuccessSnackBar({
        message: t`Catalog sync started. Try your lookup again in a moment.`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not sync the catalog`,
      });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Claim an application`}
        description={t`Take ownership of an app you published to npm. Enter its exact package name (or universal identifier) to find it.`}
      />
      <StyledRow>
        <StyledInputContainer>
          <SettingsTextInput
            instanceId="claim-application-lookup"
            value={lookupValue}
            onChange={setLookupValue}
            placeholder={t`e.g. my-twenty-app`}
            fullWidth
            label={t`Package name or universal identifier`}
          />
        </StyledInputContainer>
        <Button
          title={t`Look up`}
          Icon={IconSearch}
          onClick={handleLookup}
          disabled={isLookingUp || lookupValue.trim().length === 0}
        />
        {canSyncCatalog && (
          <Button
            title={t`Sync catalog`}
            variant="secondary"
            Icon={IconRefresh}
            onClick={handleSync}
            disabled={isSyncing}
          />
        )}
      </StyledRow>

      {notFound && (
        <StyledResultCard>
          <StyledHint>
            {t`No application found. If you just published it to npm with the "twenty-app" keyword, sync the catalog and try again.`}
          </StyledHint>
        </StyledResultCard>
      )}

      {isDefined(registration) && registration.isOwned && (
        <StyledResultCard>
          <StyledResultTitle>{registration.name}</StyledResultTitle>
          <StyledHint>{t`This application has already been claimed.`}</StyledHint>
        </StyledResultCard>
      )}

      {isDefined(registration) && !registration.isOwned && (
        <StyledResultCard>
          <StyledResultTitle>{registration.name}</StyledResultTitle>
          {isDefined(registration.description) && (
            <StyledHint>{registration.description}</StyledHint>
          )}
          {isDefined(pendingClaimCode) && !isDefined(challengeCode) && (
            <StyledHint>
              {t`A claim is already pending for this workspace. Reveal its code to finish the challenge, or verify if you already published it.`}
            </StyledHint>
          )}
          {!isDefined(challengeCode) ? (
            <StyledRow>
              {isDefined(pendingClaimCode) ? (
                <>
                  <Button
                    title={t`Reveal claim code`}
                    Icon={IconEye}
                    variant="secondary"
                    onClick={() => setChallengeCode(pendingClaimCode)}
                  />
                  <Button
                    title={t`Verify`}
                    accent="blue"
                    onClick={handleVerifyClaim}
                    disabled={isVerifying}
                  />
                </>
              ) : (
                <Button
                  title={t`Start claim`}
                  Icon={IconUserPlus}
                  accent="blue"
                  onClick={handleStartClaim}
                  disabled={isStarting}
                />
              )}
            </StyledRow>
          ) : (
            <>
              <StyledHint>
                {t`Add this to your package.json, publish a new version to npm, then verify.`}
              </StyledHint>
              <StyledCodeBlock>
                {buildPackageJsonSnippet(challengeCode)}
              </StyledCodeBlock>
              <StyledRow>
                <Button
                  title={t`Copy`}
                  variant="secondary"
                  Icon={IconCopy}
                  onClick={() =>
                    copyToClipboard(
                      buildPackageJsonSnippet(challengeCode),
                      t`Copied to clipboard`,
                    )
                  }
                />
                <Button
                  title={t`Verify`}
                  accent="blue"
                  onClick={handleVerifyClaim}
                  disabled={isVerifying}
                />
              </StyledRow>
            </>
          )}
        </StyledResultCard>
      )}
    </Section>
  );
};
