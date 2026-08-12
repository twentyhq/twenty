import { useStore } from 'jotai';

import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { massEmailPersonIdsState } from '@/activities/emails/mass-email/states/massEmailPersonIdsState';
import { massEmailRelatedSourceState } from '@/activities/emails/mass-email/states/massEmailRelatedSourceState';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import {
  AppPath,
  CoreObjectNameSingular,
  SettingsPath,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const ComposeEmailCommand = () => {
  const { connectedAccountId, loading: accountLoading } =
    useFirstConnectedAccount();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const store = useStore();
  const navigateApp = useNavigateApp();
  const navigateSettings = useNavigateSettings();

  const {
    objectMetadataItem,
    selectedRecords,
    graphqlFilter,
    targetedRecordsRule,
  } = useHeadlessCommandContextApi();

  const objectNameSingular = objectMetadataItem?.nameSingular ?? null;
  const isPerson = objectNameSingular === CoreObjectNameSingular.Person;

  const isBulkPerson =
    isPerson &&
    (selectedRecords.length > 1 || targetedRecordsRule.mode === 'exclusion');

  const { records: bulkPersonRecords, loading: bulkLoading } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.Person,
      filter: graphqlFilter ?? undefined,
      recordGqlFields: { id: true },
      limit: MAX_EMAIL_RECIPIENTS,
      skip: !isBulkPerson,
    });

  const singleSelectedRecordId = !isBulkPerson
    ? (selectedRecords[0]?.id ?? null)
    : null;

  const { defaultTo, loading: recipientLoading } =
    useResolveDefaultEmailRecipient({
      objectNameSingular,
      recordId: singleSelectedRecordId,
    });

  const handleExecute = () => {
    if (!isDefined(connectedAccountId)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    if (isBulkPerson) {
      store.set(
        massEmailPersonIdsState.atom,
        bulkPersonRecords.map((record) => record.id),
      );
      store.set(massEmailRelatedSourceState.atom, null);
      navigateApp(AppPath.MassEmail);

      return;
    }

    openComposeEmailInSidePanel({
      connectedAccountId,
      defaultTo,
      contextRecord:
        isDefined(objectNameSingular) && isDefined(singleSelectedRecordId)
          ? {
              objectNameSingular,
              recordId: singleSelectedRecordId,
            }
          : undefined,
    });
  };

  const ready =
    !accountLoading && (isBulkPerson ? !bulkLoading : !recipientLoading);

  return (
    <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready={ready} />
  );
};
