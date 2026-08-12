import { useCallback } from 'react';

import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { massEmailPersonIdsState } from '@/activities/emails/mass-email/states/massEmailPersonIdsState';
import { massEmailRelatedSourceState } from '@/activities/emails/mass-email/states/massEmailRelatedSourceState';
import { useResolveRelatedPeople } from '@/activities/emails/related-people/hooks/useResolveRelatedPeople';
import { getPrimaryEmailFromRecord } from '@/activities/emails/utils/getPrimaryEmailFromRecord';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import {
  AppPath,
  CoreObjectNameSingular,
  SettingsPath,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useComposeEmailToRelatedPeople = ({
  objectMetadataItem,
  graphqlFilter,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  graphqlFilter: RecordGqlOperationFilter | undefined;
}) => {
  const { connectedAccountId } = useFirstConnectedAccount();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const { enqueueErrorSnackBar, enqueueWarningSnackBar } = useSnackBar();
  const store = useStore();
  const navigateApp = useNavigateApp();
  const navigateSettings = useNavigateSettings();

  const { relatedPersonFieldMetadataItems, resolveRelatedPeople } =
    useResolveRelatedPeople({ objectMetadataItem, filter: graphqlFilter });

  const { findOneRecord: findOnePerson } = useLazyFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
    recordGqlFields: { id: true, emails: true },
  });

  const composeEmailToRelatedPeople = useCallback(
    async (relatedPersonFieldMetadataItem: FieldMetadataItem) => {
      if (!isDefined(connectedAccountId)) {
        navigateSettings(SettingsPath.NewAccount);

        return;
      }

      const {
        personIds,
        sourceRecordLabelsByPersonId,
        sourceRecordLabelsWithoutRelatedPerson,
        hasUnreadSourceRecords,
      } = await resolveRelatedPeople(relatedPersonFieldMetadataItem);

      if (personIds.length === 0) {
        enqueueErrorSnackBar({
          message: t`None of the selected ${objectMetadataItem.labelPlural} have a linked ${relatedPersonFieldMetadataItem.label}.`,
        });

        return;
      }

      if (personIds.length === 1) {
        const personId = personIds[0];

        await findOnePerson({
          objectRecordId: personId,
          onCompleted: (person) => {
            const primaryEmail = getPrimaryEmailFromRecord(person);

            if (!isDefined(primaryEmail)) {
              enqueueErrorSnackBar({
                message: t`The linked ${relatedPersonFieldMetadataItem.label} has no email address.`,
              });

              return;
            }

            if (sourceRecordLabelsWithoutRelatedPerson.length > 0) {
              enqueueWarningSnackBar({
                message: t`Skipped without a linked ${relatedPersonFieldMetadataItem.label}: ${sourceRecordLabelsWithoutRelatedPerson.join(', ')}`,
              });
            }

            openComposeEmailInSidePanel({
              connectedAccountId,
              defaultTo: primaryEmail,
              contextRecord: {
                objectNameSingular: CoreObjectNameSingular.Person,
                recordId: personId,
              },
            });
          },
        });

        return;
      }

      store.set(massEmailPersonIdsState.atom, personIds);
      store.set(massEmailRelatedSourceState.atom, {
        objectNameSingular: objectMetadataItem.nameSingular,
        relationFieldLabel: relatedPersonFieldMetadataItem.label,
        sourceObjectLabelPlural: objectMetadataItem.labelPlural,
        sourceRecordLabelsByPersonId,
        sourceRecordLabelsWithoutRelatedPerson,
        hasUnreadSourceRecords,
      });

      navigateApp(AppPath.MassEmail);
    },
    [
      connectedAccountId,
      enqueueErrorSnackBar,
      enqueueWarningSnackBar,
      findOnePerson,
      navigateApp,
      navigateSettings,
      objectMetadataItem.labelPlural,
      objectMetadataItem.nameSingular,
      openComposeEmailInSidePanel,
      resolveRelatedPeople,
      store,
    ],
  );

  return { relatedPersonFieldMetadataItems, composeEmailToRelatedPeople };
};
