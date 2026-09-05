import { useApolloClient } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useShareableRoles } from '@/record-share/hooks/useShareableRoles';
import { SHARING_RULES } from '@/settings/data-model/sharing/graphql/queries/sharingRulesQuery';
import { useSharingRuleAccessLevelOptions } from '@/settings/data-model/sharing/hooks/useSharingRuleAccessLevelOptions';
import { Select } from '@/ui/input/components/Select';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  type BackfillSharingRuleInput,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from '~/generated-metadata/graphql';

const PRIVATE_READABILITY_MODAL_ID = 'object-sharing-private-confirmation';
const EVERYONE_GRANTEE_VALUE = 'everyone';

const StyledModalFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
  text-align: left;
`;

type SettingsObjectSharingLevelSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

export const SettingsObjectSharingLevelSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectSharingLevelSectionProps) => {
  const { t } = useLingui();
  const apolloClient = useApolloClient();
  const { openModal, closeModal } = useModal();
  const { roles } = useShareableRoles();
  const accessLevelOptions = useSharingRuleAccessLevelOptions();
  const { updateOneObjectMetadataItem, loading } =
    useUpdateOneObjectMetadataItem();

  const [isPrivateConfirmationOpen, setIsPrivateConfirmationOpen] =
    useState(false);
  const [backfillGrantee, setBackfillGrantee] = useState(
    EVERYONE_GRANTEE_VALUE,
  );
  const [backfillAccessLevel, setBackfillAccessLevel] = useState(
    RecordShareAccessLevel.READ,
  );

  const { readability } = objectMetadataItem;
  const isLevelSelectable =
    readability === MetadataReadability.OPEN ||
    readability === MetadataReadability.PRIVATE;

  const levelOptions = [
    { value: MetadataReadability.OPEN, label: t`Open` },
    { value: MetadataReadability.PRIVATE, label: t`Private` },
    ...(isLevelSelectable
      ? []
      : [
          {
            value: readability,
            label:
              readability === MetadataReadability.INHERITED
                ? t`Inherited`
                : t`Managed by the application`,
          },
        ]),
  ];

  const parentFieldLabels = objectMetadataItem.fields
    .filter((fieldMetadataItem) =>
      objectMetadataItem.readabilityParentFieldUniversalIdentifiers?.includes(
        fieldMetadataItem.universalIdentifier,
      ),
    )
    .map((fieldMetadataItem) => fieldMetadataItem.label)
    .join(', ');

  const levelDescription =
    readability === MetadataReadability.INHERITED
      ? t`Records are readable by whoever can read the parent record through ${parentFieldLabels}.`
      : readability === MetadataReadability.PRIVATE
        ? t`Only members holding a share row on a record can read it.`
        : t`Every member the role lets in can read all records.`;

  const granteeOptions = [
    { value: EVERYONE_GRANTEE_VALUE, label: t`Everyone` },
    ...roles.map((role) => ({ value: role.id, label: role.label })),
  ];

  const closePrivateConfirmation = () => {
    closeModal(PRIVATE_READABILITY_MODAL_ID);
    setIsPrivateConfirmationOpen(false);
  };

  const handleLevelChange = async (newReadability: MetadataReadability) => {
    if (newReadability === readability) {
      return;
    }

    if (newReadability === MetadataReadability.PRIVATE) {
      setIsPrivateConfirmationOpen(true);
      openModal(PRIVATE_READABILITY_MODAL_ID);

      return;
    }

    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { readability: newReadability },
    });
  };

  const handleConfirmPrivate = async () => {
    const backfillSharingRule: BackfillSharingRuleInput =
      backfillGrantee === EVERYONE_GRANTEE_VALUE
        ? {
            granteePrincipalType: RecordSharePrincipalType.EVERYONE,
            accessLevel: backfillAccessLevel,
          }
        : {
            granteePrincipalType: RecordSharePrincipalType.ROLE,
            granteeRoleId: backfillGrantee,
            accessLevel: backfillAccessLevel,
          };

    const result = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: {
        readability: MetadataReadability.PRIVATE,
        backfillSharingRule,
      },
    });

    if (result.status === 'successful') {
      await apolloClient.refetchQueries({ include: [SHARING_RULES] });
      closePrivateConfirmation();
    }
  };

  const objectLabel = objectMetadataItem.labelPlural;

  return (
    <>
      <Select
        dropdownId="object-sharing-level"
        label={t`Level`}
        description={levelDescription}
        options={levelOptions}
        value={readability}
        disabled={isReadOnly || !isLevelSelectable || loading}
        onChange={handleLevelChange}
      />
      {isPrivateConfirmationOpen && (
        <ConfirmationModal
          modalInstanceId={PRIVATE_READABILITY_MODAL_ID}
          title={t`Make ${objectLabel} private?`}
          subtitle={
            <>
              {t`Nobody reads a private record without a share row. A first sharing rule keeps the existing records visible.`}
              <StyledModalFields>
                <Select
                  dropdownId="object-sharing-backfill-grantee"
                  label={t`Who keeps access`}
                  options={granteeOptions}
                  value={backfillGrantee}
                  isDropdownInModal
                  onChange={setBackfillGrantee}
                />
                <Select
                  dropdownId="object-sharing-backfill-access-level"
                  label={t`Access level`}
                  options={accessLevelOptions}
                  value={backfillAccessLevel}
                  isDropdownInModal
                  onChange={setBackfillAccessLevel}
                />
              </StyledModalFields>
            </>
          }
          confirmButtonText={t`Make private`}
          confirmButtonAccent="blue"
          loading={loading}
          onConfirmClick={handleConfirmPrivate}
          onClose={closePrivateConfirmation}
        />
      )}
    </>
  );
};
