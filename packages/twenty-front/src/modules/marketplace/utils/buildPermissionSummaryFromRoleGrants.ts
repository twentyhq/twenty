import { type PermissionSummaryItem } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconAddressBook,
  IconFilter,
  IconListSearch,
  IconLock,
  IconSettings,
  IconTool,
} from 'twenty-ui/icon';
import {
  ApplicationUpgradeRoleGrantType,
  type FindApplicationUpgradeRoleGrantsQuery,
} from '~/generated-metadata/graphql';

type ApplicationUpgradeRoleGrant =
  FindApplicationUpgradeRoleGrantsQuery['applicationUpgradeRoleGrants'][number];

type ObjectDescriptor = Pick<
  EnrichedObjectMetadataItem,
  'universalIdentifier' | 'labelPlural'
> & {
  fields: Pick<FieldMetadataItem, 'universalIdentifier' | 'label'>[];
};

type PermissionFlagDescriptor = {
  key: string;
  description: string;
  Icon: IconComponent;
};

const PERMISSION_FLAG_KEY_BY_UNIVERSAL_IDENTIFIER: Record<string, string> =
  Object.fromEntries(
    Object.entries(SystemPermissionFlag).map(([key, universalIdentifier]) => [
      universalIdentifier,
      key,
    ]),
  );

const getAllRecordsLabel = (action: string | null | undefined) => {
  switch (action) {
    case 'canReadObjectRecords':
      return t`Read all records`;
    case 'canUpdateObjectRecords':
      return t`Create and edit all records`;
    case 'canSoftDeleteObjectRecords':
      return t`Delete all records`;
    default:
      return t`Permanently delete all records`;
  }
};

const getObjectRecordsLabel = ({
  action,
  objectLabel,
}: {
  action: string | null | undefined;
  objectLabel: string;
}) => {
  switch (action) {
    case 'canReadObjectRecords':
      return t`Read ${objectLabel}`;
    case 'canUpdateObjectRecords':
      return t`Create and edit ${objectLabel}`;
    case 'canSoftDeleteObjectRecords':
      return t`Delete ${objectLabel}`;
    default:
      return t`Permanently delete ${objectLabel}`;
  }
};

export const buildPermissionSummaryFromRoleGrants = ({
  grants,
  objects,
  permissionFlags,
}: {
  grants: ApplicationUpgradeRoleGrant[];
  objects: ObjectDescriptor[];
  permissionFlags: PermissionFlagDescriptor[];
}): PermissionSummaryItem[] => {
  const findObject = (objectUniversalIdentifier: string | null | undefined) =>
    objects.find(
      (object) => object.universalIdentifier === objectUniversalIdentifier,
    );

  const getObjectLabel = (
    objectUniversalIdentifier: string | null | undefined,
  ) =>
    findObject(objectUniversalIdentifier)?.labelPlural ??
    t`records of an object added by this version`;

  const toSummaryItem = (
    grant: ApplicationUpgradeRoleGrant,
  ): PermissionSummaryItem => {
    switch (grant.type) {
      case ApplicationUpgradeRoleGrantType.ALL_OBJECT_RECORDS:
        return {
          Icon: IconAddressBook,
          label: getAllRecordsLabel(grant.action),
        };
      case ApplicationUpgradeRoleGrantType.ALL_SETTINGS:
        return { Icon: IconSettings, label: t`Update workspace settings` };
      case ApplicationUpgradeRoleGrantType.ALL_TOOLS:
        return { Icon: IconTool, label: t`Access all tools` };
      case ApplicationUpgradeRoleGrantType.OBJECT_RECORDS:
        return {
          Icon: IconAddressBook,
          label: getObjectRecordsLabel({
            action: grant.action,
            objectLabel: getObjectLabel(grant.objectUniversalIdentifier),
          }),
        };
      case ApplicationUpgradeRoleGrantType.FIELD_VALUE: {
        const objectLabel = getObjectLabel(grant.objectUniversalIdentifier);
        const fieldLabel =
          findObject(grant.objectUniversalIdentifier)?.fields.find(
            (field) =>
              field.universalIdentifier === grant.fieldUniversalIdentifier,
          )?.label ?? t`a restricted field`;

        return {
          Icon: IconListSearch,
          label:
            grant.action === 'canReadFieldValue'
              ? t`See ${fieldLabel} on ${objectLabel}`
              : t`Edit ${fieldLabel} on ${objectLabel}`,
        };
      }
      case ApplicationUpgradeRoleGrantType.ROW_LEVEL_RESTRICTION: {
        const objectLabel = getObjectLabel(grant.objectUniversalIdentifier);

        return {
          Icon: IconFilter,
          label: t`Access ${objectLabel} beyond their row-level restrictions`,
        };
      }
      case ApplicationUpgradeRoleGrantType.PERMISSION_FLAG: {
        const permissionFlagKey = isDefined(
          grant.permissionFlagUniversalIdentifier,
        )
          ? PERMISSION_FLAG_KEY_BY_UNIVERSAL_IDENTIFIER[
              grant.permissionFlagUniversalIdentifier
            ]
          : undefined;
        const permissionFlag = permissionFlags.find(
          (flag) => flag.key === permissionFlagKey,
        );

        return isDefined(permissionFlag)
          ? { Icon: permissionFlag.Icon, label: permissionFlag.description }
          : {
              Icon: IconLock,
              label: t`Use a permission added by this version`,
            };
      }
      default:
        return assertUnreachable(grant.type);
    }
  };

  const summaryItems = grants.map(toSummaryItem);

  return summaryItems.filter(
    (item, index) =>
      summaryItems.findIndex(({ label }) => label === item.label) === index,
  );
};
