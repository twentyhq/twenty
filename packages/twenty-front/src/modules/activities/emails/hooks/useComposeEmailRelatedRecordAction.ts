import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { t } from '@lingui/core/macro';
import { IconMail } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type UseComposeEmailRelatedRecordActionParams = {
  targetRecord: ActivityTargetableObject;
  isPermissionGated?: boolean;
};

export const useComposeEmailRelatedRecordAction = ({
  targetRecord,
  isPermissionGated = true,
}: UseComposeEmailRelatedRecordActionParams): RelatedRecordActionBinding => {
  const { openComposer, loading } =
    useComposeEmailForTargetRecord(targetRecord);
  const canComposeEmail = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );

  return {
    action: {
      id: 'compose-email',
      label: t`Compose email`,
      Icon: IconMail,
      isVisible: !isPermissionGated || canComposeEmail,
      disabled: loading,
      execute: openComposer,
    },
  };
};
