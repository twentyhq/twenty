import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ApplicationGrantObjectAccessValue } from '@/settings/applications/grant/types/ApplicationGrantObjectAccessValue';
import {
  getGrantAccessLevelLabel,
  getObjectPermissionActionsLabel,
} from '@/settings/applications/grant/utils/getObjectPermissionActionsLabel';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  GRANT_ACCESS_LEVELS,
  type GrantAccessLevel,
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from 'twenty-shared/application';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconLock, IconPlus, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type LockedObjectPermission = {
  objectMetadataId: string;
} & Record<ObjectPermissionAction, boolean>;

type SettingsApplicationGrantObjectAccessListProps = {
  requestedAllObjectsActions: ObjectPermissionAction[];
  lockedObjectPermissions: LockedObjectPermission[];
  value: ApplicationGrantObjectAccessValue;
  // Without it, the list is read-only
  onChange?: (value: ApplicationGrantObjectAccessValue) => void;
};

const StyledList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div<{ isNested?: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  min-height: 40px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  padding-left: ${({ isNested }) =>
    isNested ? themeCssVariables.spacing[8] : themeCssVariables.spacing[3]};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledName = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAccess = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  min-width: 160px;
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const ACCESS_LEVEL_OPTIONS = GRANT_ACCESS_LEVELS.map((accessLevel) => ({
  value: accessLevel,
  label: getGrantAccessLevelLabel(accessLevel),
}));

const ALL_OBJECTS = 'all';
const CHOSEN_OBJECTS = 'chosen';

export const SettingsApplicationGrantObjectAccessList = ({
  requestedAllObjectsActions,
  lockedObjectPermissions,
  value,
  onChange,
}: SettingsApplicationGrantObjectAccessListProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const [objectMetadataIdToAdd, setObjectMetadataIdToAdd] = useState<
    string | null
  >(null);
  const [accessLevelToAdd, setAccessLevelToAdd] = useState<GrantAccessLevel>(
    RecordShareAccessLevel.READ,
  );

  const isEditable = isDefined(onChange);
  const hasAllObjectsRequest = requestedAllObjectsActions.length > 0;
  const isScoped = isDefined(value.chosenObjectMetadataIds);

  const objectLabelById = new Map(
    objectMetadataItems.map(({ id, labelPlural }) => [id, labelPlural]),
  );
  const getObjectLabel = (objectMetadataId: string) =>
    objectLabelById.get(objectMetadataId) ?? objectMetadataId;

  const listedObjectMetadataIds = new Set([
    ...lockedObjectPermissions.map(({ objectMetadataId }) => objectMetadataId),
    ...(value.chosenObjectMetadataIds ?? []),
    ...value.addedObjects.map(({ objectMetadataId }) => objectMetadataId),
  ]);
  const availableObjectOptions = objectMetadataItems
    .filter(
      ({ id, isActive, isSystem }) =>
        isActive && !isSystem && !listedObjectMetadataIds.has(id),
    )
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural))
    .map(({ id, labelPlural }) => ({ value: id, label: labelPlural }));

  const handleAddObject = () => {
    if (!isDefined(objectMetadataIdToAdd)) {
      return;
    }

    onChange?.({
      ...value,
      addedObjects: [
        ...value.addedObjects,
        {
          objectMetadataId: objectMetadataIdToAdd,
          accessLevel: accessLevelToAdd,
        },
      ],
    });
    setObjectMetadataIdToAdd(null);
    setAccessLevelToAdd(RecordShareAccessLevel.READ);
  };

  const requestedAllObjectsLabel = getObjectPermissionActionsLabel(
    requestedAllObjectsActions,
  );

  return (
    <StyledList>
      {hasAllObjectsRequest && (
        <StyledRow>
          <StyledName>
            {isEditable ? (
              <Select
                dropdownId="application-grant-all-objects-scope"
                fullWidth
                dropdownWidthAuto
                value={isScoped ? CHOSEN_OBJECTS : ALL_OBJECTS}
                options={[
                  {
                    value: ALL_OBJECTS,
                    label: t`All objects (including future ones)`,
                  },
                  { value: CHOSEN_OBJECTS, label: t`Chosen objects` },
                ]}
                onChange={(scope) =>
                  onChange({
                    ...value,
                    chosenObjectMetadataIds:
                      scope === CHOSEN_OBJECTS ? [] : null,
                  })
                }
              />
            ) : isScoped ? (
              t`Chosen objects`
            ) : (
              t`All objects (including future ones)`
            )}
          </StyledName>
          <StyledAccess>{requestedAllObjectsLabel}</StyledAccess>
        </StyledRow>
      )}
      {(value.chosenObjectMetadataIds ?? []).map((objectMetadataId) => (
        <StyledRow key={objectMetadataId} isNested>
          <StyledName>{getObjectLabel(objectMetadataId)}</StyledName>
          <StyledAccess>
            {requestedAllObjectsLabel}
            {isEditable && (
              <LightIconButton
                size="xs"
                emphasis="subtle"
                aria-label={t`Remove`}
                onClick={() =>
                  onChange({
                    ...value,
                    chosenObjectMetadataIds: (
                      value.chosenObjectMetadataIds ?? []
                    ).filter((id) => id !== objectMetadataId),
                  })
                }
              >
                <IconX />
              </LightIconButton>
            )}
          </StyledAccess>
        </StyledRow>
      ))}
      {isEditable && isScoped && (
        <StyledRow isNested>
          <Select<string | null>
            dropdownId="application-grant-choose-object"
                fullWidth
            dropdownWidthAuto
            withSearchInput
            value={null}
            emptyOption={{ value: null, label: t`Choose an object` }}
            options={availableObjectOptions}
            onChange={(objectMetadataId) =>
              isDefined(objectMetadataId) &&
              onChange({
                ...value,
                chosenObjectMetadataIds: [
                  ...(value.chosenObjectMetadataIds ?? []),
                  objectMetadataId,
                ],
              })
            }
          />
        </StyledRow>
      )}
      {lockedObjectPermissions.map((lockedObjectPermission) => (
        <StyledRow key={lockedObjectPermission.objectMetadataId}>
          <StyledName>
            {getObjectLabel(lockedObjectPermission.objectMetadataId)}
            <IconLock
              size={14}
              color={themeCssVariables.font.color.tertiary}
              aria-label={t`Required by the app`}
            />
          </StyledName>
          <StyledAccess>
            {getObjectPermissionActionsLabel(
              OBJECT_PERMISSION_ACTIONS.filter(
                (action) => lockedObjectPermission[action],
              ),
            )}
          </StyledAccess>
        </StyledRow>
      ))}
      {value.addedObjects.map(({ objectMetadataId, accessLevel }) => (
        <StyledRow key={objectMetadataId}>
          <StyledName>{getObjectLabel(objectMetadataId)}</StyledName>
          <StyledAccess>
            {isEditable ? (
              <>
                <Select
                  dropdownId={`application-grant-access-level-${objectMetadataId}`}
                  dropdownWidthAuto
                  value={accessLevel}
                  options={ACCESS_LEVEL_OPTIONS}
                  onChange={(nextAccessLevel) =>
                    onChange({
                      ...value,
                      addedObjects: value.addedObjects.map((addedObject) =>
                        addedObject.objectMetadataId === objectMetadataId
                          ? { ...addedObject, accessLevel: nextAccessLevel }
                          : addedObject,
                      ),
                    })
                  }
                />
                <LightIconButton
                  size="xs"
                  emphasis="subtle"
                  aria-label={t`Remove`}
                  onClick={() =>
                    onChange({
                      ...value,
                      addedObjects: value.addedObjects.filter(
                        (addedObject) =>
                          addedObject.objectMetadataId !== objectMetadataId,
                      ),
                    })
                  }
                >
                  <IconX />
                </LightIconButton>
              </>
            ) : (
              getGrantAccessLevelLabel(accessLevel)
            )}
          </StyledAccess>
        </StyledRow>
      ))}
      {isEditable && (
        <StyledRow>
          <StyledName>
            <Select<string | null>
              dropdownId="application-grant-add-object"
                fullWidth
              dropdownWidthAuto
              withSearchInput
              value={objectMetadataIdToAdd}
              emptyOption={{ value: null, label: t`Add object` }}
              options={availableObjectOptions}
              onChange={setObjectMetadataIdToAdd}
            />
          </StyledName>
          <StyledAccess>
            <Select
              dropdownId="application-grant-add-object-access-level"
              dropdownWidthAuto
              value={accessLevelToAdd}
              options={ACCESS_LEVEL_OPTIONS}
              onChange={setAccessLevelToAdd}
            />
            <Button
              startIcon={<IconPlus />}
              variant="outline"
              size="sm"
              disabled={!isDefined(objectMetadataIdToAdd)}
              onClick={handleAddObject}
            >{t`Add`}</Button>
          </StyledAccess>
        </StyledRow>
      )}
      {!isEditable &&
        !hasAllObjectsRequest &&
        lockedObjectPermissions.length === 0 &&
        value.addedObjects.length === 0 && (
          <StyledRow>
            <StyledHint>{t`No access to your records`}</StyledHint>
          </StyledRow>
        )}
    </StyledList>
  );
};
