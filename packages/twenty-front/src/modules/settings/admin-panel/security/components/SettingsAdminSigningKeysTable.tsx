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
import { IconCopy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetSigningKeysDocument,
  type SigningKeyDto,
} from '~/generated-admin/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const REVOKE_MODAL_ID = 'revoke-signing-key-modal';

const SIGNING_KEYS_GRID_TEMPLATE_COLUMNS = '2fr 1fr 1fr 110px 130px 110px';

const StyledMonoText = styled.span`
  font-family: ${themeCssVariables.code.font.family}, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
            <TableHeader>{t`Created at`}</TableHeader>
            <TableHeader>{t`Revoked at`}</TableHeader>
            <TableHeader>{t`Status`}</TableHeader>
            <TableHeader align="right">
              {t`Verifications (last ${verifyWindowDays}d)`}
            </TableHeader>
            <TableHeader />
          </TableRow>
          {signingKeys.map((signingKey) => {
            const status = getStatusTag(signingKey);
            const isRevoked = isDefined(signingKey.revokedAt);

            return (
              <TableRow
                key={signingKey.id}
                gridTemplateColumns={SIGNING_KEYS_GRID_TEMPLATE_COLUMNS}
              >
                <TableCell
                  title={signingKey.id}
                  overflow="hidden"
                  gap={themeCssVariables.spacing[1]}
                >
                  <StyledMonoText>{signingKey.id}</StyledMonoText>
                  <Button
                    Icon={IconCopy}
                    size="small"
                    variant="tertiary"
                    onClick={() =>
                      copyToClipboard(signingKey.id, t`Key ID copied`)
                    }
                  />
                </TableCell>
                <TableCell>{formatTimestamp(signingKey.createdAt)}</TableCell>
                <TableCell>{formatTimestamp(signingKey.revokedAt)}</TableCell>
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
            <TableCell title={t`Legacy HS256 verifications`} overflow="hidden">
              <StyledMonoText>{t`Legacy (HS256)`}</StyledMonoText>
            </TableCell>
            <TableCell>{EM_DASH}</TableCell>
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
