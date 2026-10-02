import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';
import {
  type RecordPermissionsDto,
  type RecordTargetInput,
} from '~/generated-metadata/graphql';

type RecordSharingPermissionsEffectProps = {
  recordTarget: RecordTargetInput;
  permissions: RecordPermissionsDto | undefined;
};

export const RecordSharingPermissionsEffect = ({
  recordTarget,
  permissions,
}: RecordSharingPermissionsEffectProps) => {
  const { setRecordPermissions } = useRefreshRecordPermissions();
  const { objectMetadataId, recordId } = recordTarget;

  useEffect(() => {
    if (isDefined(permissions)) {
      setRecordPermissions({ objectMetadataId, recordId }, permissions);
    }
  }, [permissions, objectMetadataId, recordId, setRecordPermissions]);

  return null;
};
