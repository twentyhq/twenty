import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsApplicationGrantObjectAccessList } from '@/settings/applications/grant/components/SettingsApplicationGrantObjectAccessList';
import { SettingsApplicationGrantPendingCard } from '@/settings/applications/grant/components/SettingsApplicationGrantPendingCard';
import { SettingsApplicationGrantPermissionFlags } from '@/settings/applications/grant/components/SettingsApplicationGrantPermissionFlags';
import { type ApplicationGrantObjectAccessValue } from '@/settings/applications/grant/types/ApplicationGrantObjectAccessValue';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  GetApplicationGrantDocument,
  type GetApplicationGrantQuery,
  UpdateApplicationGrantObjectAccessDocument,
} from '~/generated-metadata/graphql';
import { getOperationName } from '~/utils/getOperationName';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsApplicationDetailAccessTabProps = {
  applicationId: string;
};

type ApplicationGrant = GetApplicationGrantQuery['applicationGrant'];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledIntro = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

const toObjectAccessValue = (
  objectAccess: NonNullable<ApplicationGrant['objectAccess']>,
): ApplicationGrantObjectAccessValue => ({
  chosenObjectMetadataIds: objectAccess.chosenObjectMetadataIds ?? null,
  addedObjects: objectAccess.addedObjects.map(
    ({ objectMetadataId, accessLevel }) => ({
      objectMetadataId,
      accessLevel:
        accessLevel as ApplicationGrantObjectAccessValue['addedObjects'][number]['accessLevel'],
    }),
  ),
});

const SettingsApplicationGrantObjectAccessEditor = ({
  applicationId,
  applicationGrant,
  savedObjectAccess,
}: {
  applicationId: string;
  applicationGrant: ApplicationGrant;
  savedObjectAccess: ApplicationGrantObjectAccessValue;
}) => {
  const { enqueueToast } = useToast();
  const [objectAccess, setObjectAccess] = useState(savedObjectAccess);
  const [updateObjectAccess, { loading }] = useMutation(
    UpdateApplicationGrantObjectAccessDocument,
  );

  const isDirty = !isDeeplyEqual(objectAccess, savedObjectAccess);

  const handleSave = async () => {
    try {
      await updateObjectAccess({
        variables: { input: { applicationId, objectAccess } },
        refetchQueries: [
          getOperationName(GET_ROLES) ?? '',
          getOperationName(GetApplicationGrantDocument) ?? '',
        ],
        awaitRefetchQueries: true,
      });
      enqueueToast({ status: 'success', children: t`Access saved` });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Access to your records`}
        description={t`Locked objects are required by the app. You can choose which objects "all objects" covers, and add objects.`}
        actions={
          isDirty && (
            <StyledActions>
              <SaveAndCancelButtons
                onSave={handleSave}
                onCancel={() => setObjectAccess(savedObjectAccess)}
                isLoading={loading}
              />
            </StyledActions>
          )
        }
      />
      <SettingsApplicationGrantObjectAccessList
        requestedAllObjectsActions={applicationGrant.requestedAllObjectsActions.filter(
          (action): action is ObjectPermissionAction =>
            (OBJECT_PERMISSION_ACTIONS as readonly string[]).includes(action),
        )}
        lockedObjectPermissions={applicationGrant.lockedObjectPermissions}
        value={objectAccess}
        onChange={setObjectAccess}
      />
    </Section.Root>
  );
};

export const SettingsApplicationDetailAccessTab = ({
  applicationId,
}: SettingsApplicationDetailAccessTabProps) => {
  const { data, loading } = useQuery(GetApplicationGrantDocument, {
    variables: { applicationId },
    fetchPolicy: 'network-only',
  });

  const applicationGrant = data?.applicationGrant;
  const grantRoleId = applicationGrant?.grantRoleId;
  const objectAccess = applicationGrant?.objectAccess;

  if (loading && !isDefined(applicationGrant)) {
    return <SettingsSectionSkeletonLoader />;
  }

  if (
    !isDefined(applicationGrant) ||
    !isDefined(grantRoleId) ||
    !isDefined(objectAccess)
  ) {
    return (
      <StyledIntro>{t`This app has no granted role, so it has no access to your data.`}</StyledIntro>
    );
  }

  const savedObjectAccess = toObjectAccessValue(objectAccess);

  return (
    <StyledContainer>
      <SettingsRolesQueryEffect />
      <SettingsApplicationGrantPendingCard
        applicationId={applicationId}
        applicationGrant={applicationGrant}
      />
      <SettingsApplicationGrantObjectAccessEditor
        // Remounts with the saved access after a save or an approval
        key={JSON.stringify(savedObjectAccess)}
        applicationId={applicationId}
        applicationGrant={applicationGrant}
        savedObjectAccess={savedObjectAccess}
      />
      <SettingsApplicationGrantPermissionFlags grantRoleId={grantRoleId} />
    </StyledContainer>
  );
};
