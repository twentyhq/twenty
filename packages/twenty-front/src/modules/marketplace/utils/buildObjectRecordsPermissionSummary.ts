import { type PermissionSummaryItem } from '@/marketplace/types/PermissionSummaryItem';
import { type RecordAccess } from '@/marketplace/types/RecordAccess';
import { getRecordAccessLabel } from '@/marketplace/utils/getRecordAccessLabel';
import { plural } from '@lingui/core/macro';
import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IconAddressBook } from 'twenty-ui/icon';

type ObjectPermissionGroup = {
  access: RecordAccess;
  objectUniversalIdentifiers: string[];
};

const getRecordAccessKey = ({ canRead, canWrite, canDelete }: RecordAccess) =>
  `${canRead ? 'read' : ''}-${canWrite ? 'write' : ''}-${canDelete ? 'delete' : ''}`;

const getAccessBeyondRole = ({
  objectPermission,
  roleAccess,
}: {
  objectPermission: NonNullable<RoleManifest['objectPermissions']>[number];
  roleAccess: RecordAccess;
}): RecordAccess => ({
  canRead:
    (objectPermission.canReadObjectRecords ?? false) && !roleAccess.canRead,
  canWrite:
    (objectPermission.canUpdateObjectRecords ?? false) && !roleAccess.canWrite,
  canDelete:
    ((objectPermission.canSoftDeleteObjectRecords ?? false) ||
      (objectPermission.canDestroyObjectRecords ?? false)) &&
    !roleAccess.canDelete,
});

const groupObjectPermissionsByAccess = ({
  defaultRole,
  roleAccess,
}: {
  defaultRole: RoleManifest;
  roleAccess: RecordAccess;
}): ObjectPermissionGroup[] => {
  const groupsByAccessKey = new Map<string, ObjectPermissionGroup>();

  for (const objectPermission of defaultRole.objectPermissions ?? []) {
    const access = getAccessBeyondRole({ objectPermission, roleAccess });

    if (!access.canRead && !access.canWrite && !access.canDelete) {
      continue;
    }

    const accessKey = getRecordAccessKey(access);
    const group = groupsByAccessKey.get(accessKey) ?? {
      access,
      objectUniversalIdentifiers: [],
    };

    if (
      !group.objectUniversalIdentifiers.includes(
        objectPermission.objectUniversalIdentifier,
      )
    ) {
      group.objectUniversalIdentifiers.push(
        objectPermission.objectUniversalIdentifier,
      );
    }

    groupsByAccessKey.set(accessKey, group);
  }

  return Array.from(groupsByAccessKey.values());
};

export const buildObjectRecordsPermissionSummary = ({
  defaultRole,
  roleAccess,
  objectLabelsByUniversalIdentifier,
}: {
  defaultRole: RoleManifest;
  roleAccess: RecordAccess;
  objectLabelsByUniversalIdentifier: Record<string, string>;
}): PermissionSummaryItem[] =>
  groupObjectPermissionsByAccess({ defaultRole, roleAccess }).flatMap(
    ({ access, objectUniversalIdentifiers }) => {
      const label = getRecordAccessLabel({
        access,
        target: plural(objectUniversalIdentifiers.length, {
          one: '# object',
          other: '# objects',
        }),
      });

      if (!isDefined(label)) {
        return [];
      }

      const resolvedLabels = objectUniversalIdentifiers
        .filter((objectUniversalIdentifier) =>
          Object.hasOwn(
            objectLabelsByUniversalIdentifier,
            objectUniversalIdentifier,
          ),
        )
        .map(
          (objectUniversalIdentifier) =>
            objectLabelsByUniversalIdentifier[objectUniversalIdentifier],
        );

      if (resolvedLabels.length === 0) {
        return [{ Icon: IconAddressBook, label }];
      }

      const unresolvedCount =
        objectUniversalIdentifiers.length - resolvedLabels.length;

      const detailsTitle =
        getRecordAccessLabel({
          access,
          target: plural(objectUniversalIdentifiers.length, {
            one: '# object record:',
            other: '# object records:',
          }),
        }) ?? label;

      const detailsItems = [
        ...resolvedLabels,
        ...(unresolvedCount > 0
          ? [
              plural(unresolvedCount, {
                one: '# other object',
                other: '# other objects',
              }),
            ]
          : []),
      ];

      return [
        {
          Icon: IconAddressBook,
          label,
          details: { title: detailsTitle, items: detailsItems },
        },
      ];
    },
  );
