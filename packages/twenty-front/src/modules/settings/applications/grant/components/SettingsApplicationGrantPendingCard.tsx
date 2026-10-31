import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconCheck, IconLock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  ApproveApplicationGrantPendingPermissionsDocument,
  type GetApplicationGrantQuery,
} from '~/generated-metadata/graphql';
import { getOperationName } from '~/utils/getOperationName';

type SettingsApplicationGrantPendingCardProps = {
  applicationId: string;
  applicationGrant: GetApplicationGrantQuery['applicationGrant'];
};

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.color.blue7};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[5]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SettingsApplicationGrantPendingCard = ({
  applicationId,
  applicationGrant,
}: SettingsApplicationGrantPendingCardProps) => {
  const { enqueueToast } = useToast();
  const [approvePendingPermissions, { loading }] = useMutation(
    ApproveApplicationGrantPendingPermissionsDocument,
  );

  if (!isNonEmptyArray(applicationGrant.pendingPermissions)) {
    return null;
  }

  const version = applicationGrant.applicationVersion ?? '';

  const handleApprove = async () => {
    try {
      await approvePendingPermissions({
        variables: { applicationId },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
        awaitRefetchQueries: true,
      });
      enqueueToast({ status: 'success', children: t`Permissions approved` });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <StyledCard>
      <StyledHeader>
        <StyledTitle>
          <IconLock size={16} aria-hidden />
          {t`Version ${version} asks for:`}
        </StyledTitle>
        <Button
          startIcon={<IconCheck />}
          variant="solid"
          color="accent"
          size="sm"
          onClick={handleApprove}
          disabled={loading}
        >{t`Approve`}</Button>
      </StyledHeader>
      <StyledList>
        {applicationGrant.pendingPermissions.map((pendingPermission) => (
          <li key={pendingPermission.label}>{pendingPermission.label}</li>
        ))}
      </StyledList>
      <StyledHint>{t`The app keeps running with its current access until you approve.`}</StyledHint>
    </StyledCard>
  );
};
