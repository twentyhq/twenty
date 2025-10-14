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
  isCustom,
  isRemote,
  applicationId,
}: {
  isCustom?: boolean;
  isRemote?: boolean;
  applicationId?: string | null;
}): ItemTagInfo =>
  isDefined(applicationId)
    ? {
        labelText: 'Managed',
        labelColor: 'sky',
      }
    : isCustom
      ? {
          labelText: 'Custom',
          labelColor: 'orange',
        }
      : isRemote
        ? {
            labelText: 'Remote',
            labelColor: 'green',
          }
        : {
            labelText: 'Standard',
            labelColor: 'blue',
          };
