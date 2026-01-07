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

export const getItemTagInfo = ({
  item: { isCustom, isRemote, applicationId },
  workspaceCustomApplicationId,
}: {
  item: {
    isCustom?: boolean;
    isRemote?: boolean;
    applicationId?: string | null;
  };
  workspaceCustomApplicationId?: string;
}): ItemTagInfo => {
  if (
    isDefined(applicationId) &&
    applicationId !== workspaceCustomApplicationId
  ) {
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
