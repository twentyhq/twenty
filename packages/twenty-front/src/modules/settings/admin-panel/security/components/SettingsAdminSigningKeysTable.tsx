import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminRevokeSigningKeyConfirmationModal } from '@/settings/admin-panel/security/components/SettingsAdminRevokeSigningKeyConfirmationModal';
import { useRevokeSigningKey } from '@/settings/admin-panel/security/hooks/useRevokeSigningKey';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag, type TagColor } from 'twenty-ui/components';
import { IconCopy, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetSigningKeysDocument,
  type SigningKeyDto,
} from '~/generated-admin/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const REVOKE_MODAL_ID = 'revoke-signing-key-modal';

const SIGNING_KEYS_GRID_TEMPLATE_COLUMNS = '2fr 88px 96px 96px 88px';

const StyledKeyCellContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledOverflowingTextContainer = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const EM_DASH = '\u2014';

type SelectedSigningKey = {
  id: string;
  isCurrent: boolean;
};

const getStatusTag = (
  signingKey: Pick<SigningKeyDto, 'isCurrent' | 'revokedAt'>,
): { text: string; color: TagColor } => {
  if (isDefined(signingKey.revokedAt)) {
    return { text: t`Revoked`, color: 'red' };
  }

  if (signingKey.isCurrent === true) {
    return { text: t`Current`, color: 'green' };
  }

  return { text: t`Active`, color: 'gray' };
};

const formatTimestamp = (value: string | null | undefined): string => {
  if (!isDefined(value)) {
    return EM_DASH;
  }

  return new Date(value).toLocaleString();
};

const formatDate = (value: string | null | undefined): string => {
  if (!isDefined(value)) {
    return EM_DASH;
  }

  return new Date(value).toLocaleDateString();
};

export const SettingsAdminSigningKeysTable = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { openModal } = useModal();
  const { copyToClipboard } = useCopyToClipboard();
  const [selectedSigningKey, setSelectedSigningKey] =
    useState<SelectedSigningKey | null>(null);

  const { data, loading } = useQuery(GetSigningKeysDocument, {
    client: apolloAdminClient,
    fetchPolicy: 'network-only',
  });

  const { revokeSigningKey, isRevoking } = useRevokeSigningKey(() => {
    setSelectedSigningKey(null);
  });

  const handleRevokeClick = (signingKey: SelectedSigningKey) => {
    setSelectedSigningKey(signingKey);
    openModal(REVOKE_MODAL_ID);
  };

  const handleConfirmRevoke = async () => {
    if (!isDefined(selectedSigningKey)) {
      return;
    }

    await revokeSigningKey(selectedSigningKey.id);
  };

  if (loading && !isDefined(data)) {
    return <SettingsSectionSkeletonLoader />;
  }

  const signingKeys = data?.getSigningKeys.signingKeys ?? [];
  const legacyVerifyCountInWindow =
    data?.getSigningKeys.legacyVerifyCountInWindow ?? 0;
  const verifyWindowDays = data?.getSigningKeys.verifyWindowDays ?? 7;

  return (
    <>
      <Table>
        <TableBody>
          <TableRow gridTemplateColumns={SIGNING_KEYS_GRID_TEMPLATE_COLUMNS}>
            <TableHeader>{t`Key ID`}</TableHeader>
            <TableHeader>{t`Revoked`}</TableHeader>
            <TableHeader>{t`Status`}</TableHeader>
            <TableHeader align="right">
              {t`Uses (last ${verifyWindowDays}d)`}
            </TableHeader>
            <TableHeader />
          </TableRow>
          {signingKeys.map((signingKey) => {
            const status = getStatusTag(signingKey);
            const isRevoked = isDefined(signingKey.revokedAt);
            const tooltipContent = t`Created on ${formatTimestamp(signingKey.createdAt)}`;

            return (
              <TableRow
                key={signingKey.id}
                gridTemplateColumns={SIGNING_KEYS_GRID_TEMPLATE_COLUMNS}
              >
                <TableCell overflow="hidden">
                  <StyledKeyCellContent>
                    <StyledOverflowingTextContainer>
                      <OverflowingTextWithTooltip
                        text={signingKey.id}
                        tooltipContent={tooltipContent}
                        alwaysShowTooltip
                      />
                    </StyledOverflowingTextContainer>
                    <Button
                      Icon={IconCopy}
                      size="small"
                      variant="tertiary"
                      ariaLabel={t`Copy key ID`}
                      onClick={() =>
                        copyToClipboard(signingKey.id, t`Key ID copied`)
                      }
                    />
                  </StyledKeyCellContent>
                </TableCell>
                <TableCell>
                  {isDefined(signingKey.revokedAt) ? (
                    <OverflowingTextWithTooltip
                      text={formatDate(signingKey.revokedAt)}
                      tooltipContent={t`Revoked on ${formatTimestamp(signingKey.revokedAt)}`}
                      alwaysShowTooltip
                    />
                  ) : (
                    EM_DASH
                  )}
                </TableCell>
                <TableCell>
                  <Tag text={status.text} color={status.color} />
                </TableCell>
                <TableCell align="right">
                  {signingKey.verifyCountInWindow}
                </TableCell>
                <TableCell align="right">
                  <Button
                    title={t`Revoke`}
                    size="small"
                    variant="secondary"
                    accent="danger"
                    disabled={isRevoked || isRevoking}
                    onClick={() =>
                      handleRevokeClick({
                        id: signingKey.id,
                        isCurrent: signingKey.isCurrent,
                      })
                    }
                  />
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow gridTemplateColumns={SIGNING_KEYS_GRID_TEMPLATE_COLUMNS}>
            <TableCell overflow="hidden">
              <StyledKeyCellContent>
                <StyledOverflowingTextContainer>
                  <OverflowingTextWithTooltip
                    text={t`Legacy (HS256)`}
                    tooltipContent={t`Legacy HS256 verifications across all tokens`}
                    alwaysShowTooltip
                  />
                </StyledOverflowingTextContainer>
              </StyledKeyCellContent>
            </TableCell>
            <TableCell>{EM_DASH}</TableCell>
            <TableCell>
              <Tag text={t`Legacy`} color="gray" />
            </TableCell>
            <TableCell align="right">{legacyVerifyCountInWindow}</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableBody>
      </Table>
      <SettingsAdminRevokeSigningKeyConfirmationModal
        modalInstanceId={REVOKE_MODAL_ID}
        isCurrent={selectedSigningKey?.isCurrent === true}
        onConfirm={handleConfirmRevoke}
        onClose={() => setSelectedSigningKey(null)}
      />
    </>
  );
};
