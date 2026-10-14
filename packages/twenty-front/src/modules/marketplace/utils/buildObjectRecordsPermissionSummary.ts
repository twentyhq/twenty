import { type ObjectLabels } from '@/marketplace/types/ObjectLabels';
import { type PermissionSummaryItem } from '@/marketplace/types/PermissionSummaryItem';
import { type RecordAccess } from '@/marketplace/types/RecordAccess';
import { getRecordAccessLabel } from '@/marketplace/utils/getRecordAccessLabel';
import { plural } from '@lingui/core/macro';
import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IconAddressBook } from 'twenty-ui/icon';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

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
  objectLabelsByUniversalIdentifier: Record<string, ObjectLabels>;
}): PermissionSummaryItem[] =>
  groupObjectPermissionsByAccess({ defaultRole, roleAccess }).flatMap(
    ({ access, objectUniversalIdentifiers }) => {
      const resolvedObjectLabels = objectUniversalIdentifiers
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

      const unresolvedCount =
        objectUniversalIdentifiers.length - resolvedObjectLabels.length;

      const targetParts = [
        ...resolvedObjectLabels.map(({ labelPlural }) => labelPlural),
        ...(unresolvedCount > 0
          ? [
              plural(unresolvedCount, {
                one: '# other object',
                other: '# other objects',
              }),
            ]
          : []),
      ];

      const label = getRecordAccessLabel({
        access,
        target: formatDisplayList(targetParts),
      });

      if (!isDefined(label)) {
        return [];
      }

      const details = resolvedObjectLabels.map(
        ({ labelSingular }) => labelSingular,
      );

      return [
        {
          Icon: IconAddressBook,
          label,
          ...(details.length > 0 ? { details } : {}),
        },
      ];
    },
  );
