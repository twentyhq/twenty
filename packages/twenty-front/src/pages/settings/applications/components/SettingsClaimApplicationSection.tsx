import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
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
  CancelApplicationRegistrationClaimDocument,
  FindClaimableApplicationRegistrationDocument,
  FindManyApplicationRegistrationsDocument,
  FindPendingApplicationRegistrationClaimsDocument,
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

const CANCEL_CLAIM_MODAL_ID = 'cancel-application-claim-modal';

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
  const { openModal, closeModal } = useModal();

  const [lookupValue, setLookupValue] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [revealedClaimIds, setRevealedClaimIds] = useState<string[]>([]);
  const [claimToCancel, setClaimToCancel] = useState<{
    applicationRegistrationId: string;
    name: string;
  } | null>(null);

  const canSyncCatalog = useHasPermissionFlag(
    PermissionFlagType.MARKETPLACE_APPS,
  );

  const { data: pendingClaimsData, refetch: refetchPendingClaims } = useQuery(
    FindPendingApplicationRegistrationClaimsDocument,
    { fetchPolicy: 'network-only' },
  );

  const [runLookup, { data: lookupData, loading: isLookingUp }] = useLazyQuery(
    FindClaimableApplicationRegistrationDocument,
    { fetchPolicy: 'network-only' },
  );

  const [startClaim, { loading: isStarting }] = useMutation(
    StartApplicationRegistrationClaimDocument,
  );

  const [verifyClaim, { loading: isVerifying }] = useMutation(
    VerifyApplicationRegistrationClaimDocument,
    { refetchQueries: [FindManyApplicationRegistrationsDocument] },
  );

  const [cancelClaim, { loading: isCancelling }] = useMutation(
    CancelApplicationRegistrationClaimDocument,
  );

  const [syncCatalog, { loading: isSyncing }] = useMutation(
    SyncMarketplaceCatalogDocument,
  );

  const registration = lookupData?.findClaimableApplicationRegistration ?? null;

  const pendingClaims =
    pendingClaimsData?.findPendingApplicationRegistrationClaims ?? [];

  const lookupPendingClaim = isDefined(registration)
    ? (pendingClaims.find(
        (claim) => claim.applicationRegistrationId === registration.id,
      ) ?? null)
    : null;

  // Claims started earlier stay visible until verified or canceled, even
  // without a fresh lookup; the one matching the current lookup renders in
  // the lookup card instead.
  const standingClaims = pendingClaims.filter(
    (claim) => claim.applicationRegistrationId !== registration?.id,
  );

  const handleLookup = async () => {
    const trimmed = lookupValue.trim();

    if (trimmed.length === 0) {
      return;
    }

    setNotFound(false);
    setChallengeCode(null);

    const variables = UUID_REGEX.test(trimmed)
      ? { universalIdentifier: trimmed }
      : { sourcePackage: trimmed };

    try {
      const result = await runLookup({ variables });

      if (!isDefined(result.data?.findClaimableApplicationRegistration)) {
        setNotFound(true);
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
      await refetchPendingClaims();
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Could not start the claim`,
      });
    }
  };

  const handleVerifyClaim = async (applicationRegistrationId: string) => {
    try {
      await verifyClaim({
        variables: { applicationRegistrationId },
      });

      enqueueSuccessSnackBar({ message: t`Application claimed successfully` });

      navigate(SettingsPath.ApplicationRegistrationDetail, {
        applicationRegistrationId,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not verify the claim`,
      });
      await refetchPendingClaims();
    }
  };

  const handleOpenCancelModal = (claim: {
    applicationRegistrationId: string;
    name: string;
  }) => {
    setClaimToCancel(claim);
    openModal(CANCEL_CLAIM_MODAL_ID);
  };

  const handleConfirmCancelClaim = async () => {
    if (!isDefined(claimToCancel)) {
      return;
    }

    try {
      await cancelClaim({
        variables: {
          applicationRegistrationId: claimToCancel.applicationRegistrationId,
        },
      });

      enqueueSuccessSnackBar({ message: t`Claim canceled` });

      setChallengeCode(null);
      setRevealedClaimIds((previousRevealedClaimIds) =>
        previousRevealedClaimIds.filter(
          (id) => id !== claimToCancel.applicationRegistrationId,
        ),
      );
      await refetchPendingClaims();
      closeModal(CANCEL_CLAIM_MODAL_ID);
      setClaimToCancel(null);
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not cancel the claim`,
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

  const renderChallengeActions = (claim: {
    applicationRegistrationId: string;
    name: string;
    token: string;
    isRevealed: boolean;
    onReveal: () => void;
  }) => (
    <>
      {claim.isRevealed && (
        <>
          <StyledHint>
            {t`Add this to your package.json, publish a new version to npm, then verify.`}
          </StyledHint>
          <StyledCodeBlock>
            {buildPackageJsonSnippet(claim.token)}
          </StyledCodeBlock>
        </>
      )}
      <StyledRow>
        {claim.isRevealed ? (
          <Button
            title={t`Copy`}
            variant="secondary"
            Icon={IconCopy}
            onClick={() =>
              copyToClipboard(
                buildPackageJsonSnippet(claim.token),
                t`Copied to clipboard`,
              )
            }
          />
        ) : (
          <Button
            title={t`Reveal claim code`}
            Icon={IconEye}
            variant="secondary"
            onClick={claim.onReveal}
          />
        )}
        <Button
          title={t`Verify`}
          accent="blue"
          onClick={() => handleVerifyClaim(claim.applicationRegistrationId)}
          disabled={isVerifying}
        />
        <Button
          title={t`Cancel claim`}
          variant="secondary"
          accent="danger"
          onClick={() =>
            handleOpenCancelModal({
              applicationRegistrationId: claim.applicationRegistrationId,
              name: claim.name,
            })
          }
          disabled={isCancelling}
        />
      </StyledRow>
    </>
  );

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
          {isDefined(lookupPendingClaim) || isDefined(challengeCode) ? (
            <>
              {!isDefined(challengeCode) && (
                <StyledHint>
                  {t`A claim is already pending for this workspace. Reveal its code to finish the challenge, or verify if you already published it.`}
                </StyledHint>
              )}
              {renderChallengeActions({
                applicationRegistrationId: registration.id,
                name: registration.name,
                token: challengeCode ?? lookupPendingClaim?.token ?? '',
                isRevealed: isDefined(challengeCode),
                onReveal: () =>
                  setChallengeCode(lookupPendingClaim?.token ?? null),
              })}
            </>
          ) : (
            <StyledRow>
              <Button
                title={t`Start claim`}
                Icon={IconUserPlus}
                accent="blue"
                onClick={handleStartClaim}
                disabled={isStarting}
              />
            </StyledRow>
          )}
        </StyledResultCard>
      )}

      {standingClaims.map((claim) => {
        const isRevealed = revealedClaimIds.includes(
          claim.applicationRegistrationId,
        );

        return (
          <StyledResultCard key={claim.applicationRegistrationId}>
            <StyledResultTitle>{claim.name}</StyledResultTitle>
            {isDefined(claim.description) && (
              <StyledHint>{claim.description}</StyledHint>
            )}
            {!isRevealed && (
              <StyledHint>
                {t`A claim is pending for this workspace. Reveal its code to finish the challenge, or verify if you already published it.`}
              </StyledHint>
            )}
            {renderChallengeActions({
              applicationRegistrationId: claim.applicationRegistrationId,
              name: claim.name,
              token: claim.token,
              isRevealed,
              onReveal: () =>
                setRevealedClaimIds((previousRevealedClaimIds) => [
                  ...previousRevealedClaimIds,
                  claim.applicationRegistrationId,
                ]),
            })}
          </StyledResultCard>
        );
      })}

      <ConfirmationModal
        modalInstanceId={CANCEL_CLAIM_MODAL_ID}
        title={t`Cancel claim`}
        subtitle={t`This will discard the pending ownership claim for "${claimToCancel?.name ?? ''}". The published claim code will no longer work and you will have to start a new claim.`}
        onConfirmClick={handleConfirmCancelClaim}
        confirmButtonText={t`Cancel claim`}
        confirmButtonAccent="danger"
        loading={isCancelling}
      />
    </Section>
  );
};
