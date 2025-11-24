import { isDefined } from 'twenty-shared/utils';

export type ItemTagInfo =
  | StandardItemTagInfo
  | CustomItemTagInfo
  | RemoteItemTagInfo
  | ManagedItemTagInfo;

type StandardItemTagInfo = {
  labelText: 'Standard';
  labelColor: 'blue';
};

type CustomItemTagInfo = {
  labelText: 'Custom';
  labelColor: 'orange';
};

type RemoteItemTagInfo = {
  labelText: 'Remote';
  labelColor: 'green';
};

type ManagedItemTagInfo = {
  labelText: 'Managed';
  labelColor: 'sky';
};

//  We should add currentWorkspaceCustomApplicationId here too
export const getItemTagInfo = ({
  isCustom,
  isRemote,
  applicationId,
}: {
  isCustom?: boolean;
  isRemote?: boolean;
  applicationId?: string | null;
}): ItemTagInfo => {
  if (isDefined(applicationId)) {
    return { labelText: 'Managed', labelColor: 'sky' };
  }

  if (isCustom!!) {
    return { labelText: 'Custom', labelColor: 'orange' };
  }

  if (isRemote!!) {
    return { labelText: 'Remote', labelColor: 'green' };
  }

  return { labelText: 'Standard', labelColor: 'blue' };
};
